#!/usr/bin/env node
// check-sdlc.mjs — deterministic artifact-chain gate ([M:sdlc], TEMPLATE.md §5.5; ADR-0031).
//
// Validates that a PR's changes are covered by complete work-item folders. Zero dependencies
// (Node stdlib only). The CONFIG block is PROJECT-OWNED — tune it here; do not push
// ecosystem- or stack-specific values upstream.
//
// Usage (CI):  node scripts/check-sdlc.mjs --base origin/dev [--head <sha>]
// Self-test:   node scripts/check-sdlc.mjs --self-test   (built-in fixture assertions)
//
// Exit codes: 0 = chain satisfied · 1 = violation (message names the rule).

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// ─── CONFIG (project-owned) ─────────────────────────────────────────────────────────────────
const CONFIG = {
  // Work-item home (srd slot {{INTENT_DIR}}).
  INTENT_DIR: "intent",

  // Glob-style paths (doublestar supported) that are sensitive: mini-tier units cannot touch
  // them; REQUIRE_APPROVED_BY applies to them. Empty list = those two rules are off.
  SENSITIVE_PATHS: [],

  // When true, a diff touching SENSITIVE_PATHS requires an `Approved-by: <name>` line in the
  // PR body (deterministic substitute where branch protection is unavailable, e.g. private
  // repos on GitHub Free). Body is read from $PR_BODY or `gh pr view`.
  REQUIRE_APPROVED_BY: false,

  // Diff base used when --base is not passed (integration branch, remote-tracking form).
  DEFAULT_REF: "origin/main",
};
// ────────────────────────────────────────────────────────────────────────────────────────────

const TIER_FOLD_SECTIONS = ["## Spec (mini)", "## Plan (mini)"];
const INFRA_FILES = [".srd.json", "AGENTS.md", "README.md", "CHANGELOG.md", "REVIEW.md"];

const globToRx = (g) =>
  new RegExp(`^${g.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*\*/g, ".*").replace(/\*/g, "[^/]*")}$`);

const sh = (cmd, args_, opts = {}) => execFileSync(cmd, args_, { encoding: "utf8", ...opts }).trim();
const frontmatter = (text, key) => {
  const m = text?.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const line = m && m[1].split(/\r?\n/).find((l) => l.startsWith(`${key}:`));
  return line ? line.slice(key.length + 1).trim() : null;
};

/** Core rule engine. Returns violations[] for a set of changed files. */
export function check(changed, read = (p) => (existsSync(p) ? readFileSync(p, "utf8") : null)) {
  const v = [];
  const sensitiveTouched = changed.filter((f) => CONFIG.SENSITIVE_PATHS.some((g) => globToRx(g).test(f)));

  const slugs = new Set();
  const outside = [];
  for (const f of changed) {
    if (f.startsWith(`${CONFIG.INTENT_DIR}/`)) {
      const slug = f.slice(CONFIG.INTENT_DIR.length + 1).split("/")[0];
      if (slug && slug.includes("-")) slugs.add(slug);
    } else if (!INFRA_FILES.includes(f) && !f.startsWith(".github/")) {
      outside.push(f);
    }
  }

  if (outside.length && !slugs.size) {
    v.push(`code changed (${outside.slice(0, 3).join(", ")}${outside.length > 3 ? ", …" : ""}) but no work-item folder under ${CONFIG.INTENT_DIR}/ changed — capture the work first (ADR-0028/0030)`);
  }

  for (const slug of slugs) {
    const dir = `${CONFIG.INTENT_DIR}/${slug}`;
    const intent = read(join(dir, "intent.md"));
    if (intent === null) { v.push(`work item "${slug}" is referenced by the diff but ${dir}/intent.md is missing`); continue; }

    const tier = (frontmatter(intent, "tier") || "full").toLowerCase();
    const type = (frontmatter(intent, "type") || "feat").toLowerCase();
    const status = frontmatter(intent, "status") || "Draft";
    if (status !== "Accepted" && status !== "Approved") {
      v.push(`work item "${slug}" intent status is "${status}" — the Plan gate (product-owner acceptance) has not passed`);
    }

    if (tier === "mini") {
      if (type !== "fix") v.push(`work item "${slug}" is tier: mini but type is "${type}" — mini requires type: fix (ADR-0031)`);
      const missing = TIER_FOLD_SECTIONS.filter((s) => !intent.includes(s));
      if (missing.length) v.push(`mini work item "${slug}" is missing folded section(s): ${missing.join(", ")}`);
      const touched = changed.filter((f) => !f.startsWith(`${CONFIG.INTENT_DIR}/`) && sensitiveTouched.includes(f));
      if (touched.length) v.push(`mini work item "${slug}" touches sensitive path(s): ${touched.join(", ")} — sensitive changes require a full-tier unit`);
      continue;
    }

    for (const f of ["spec.md", "plan.md"]) {
      if (read(join(dir, f)) === null) v.push(`work item "${slug}" is full-tier but ${dir}/${f} is missing (ADR-0030 schema)`);
    }
    const specStatus = frontmatter(read(`${dir}/spec.md`), "status");
    if (specStatus !== "Approved") {
      v.push(`work item "${slug}" spec status is "${specStatus}" — the Design gate (product-owner approval) has not passed`);
    }
  }

  if (CONFIG.REQUIRE_APPROVED_BY && sensitiveTouched.length) {
    const body = process.env.PR_BODY || "";
    if (!/^Approved-by:\s*\S+/m.test(body)) {
      v.push("diff touches SENSITIVE_PATHS and no `Approved-by: <name>` line was found (set $PR_BODY or authenticate gh — ADR-0031)");
    }
  }
  return v;
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes("--self-test")) return selfTest();
  const base = args.includes("--base") ? args[args.indexOf("--base") + 1] : CONFIG.DEFAULT_REF;
  const headIx = args.indexOf("--head");
  const head = headIx > -1 ? args[headIx + 1] : undefined;
  const range = head ? `${base}...${head}` : base;
  const changed = sh("git", ["diff", "--name-only", range]).split("\n").filter(Boolean);
  if (!changed.length) return console.log("· check-sdlc: no changed files");

  const violations = check(changed);
  for (const x of violations) console.error(`✖ check-sdlc: ${x}`);
  if (violations.length) process.exit(1);
  console.log(`· check-sdlc: chain gate passed (${changed.length} file(s))`);
}

// ─── self-test: fixtures built in a throwaway git repo, run through the same engine ─────────
function selfTest() {
  const fm = (kv) => `---\n${Object.entries(kv).map(([k, val]) => `${k}: ${val}`).join("\n")}\n---\n`;
  const cases = [
    { name: "full unit passes", files: { "intent/2026-01-01-demo/intent.md": fm({ status: "Accepted", type: "feat", tier: "full" }) + "# Intent: demo\n", "intent/2026-01-01-demo/spec.md": fm({ status: "Approved" }) + "sign-off: PO\n", "intent/2026-01-01-demo/plan.md": "# Plan\n" }, src: ["apps/web/x.ts"], expect: 0 },
    { name: "feat without spec fails", files: { "intent/2026-01-02-bad/intent.md": fm({ status: "Accepted", type: "feat", tier: "full" }) }, src: ["apps/web/y.ts"], expect: "fail" },
    { name: "unaccepted intent fails", files: { "intent/2026-01-05-draft/intent.md": fm({ status: "Draft", type: "feat", tier: "full" }), "intent/2026-01-05-draft/spec.md": fm({ status: "Approved" }), "intent/2026-01-05-draft/plan.md": "# p\n" }, src: ["apps/web/d.ts"], expect: "fail" },
    { name: "mini (fix, folded) passes", files: { "intent/2026-01-03-typo/intent.md": fm({ status: "Accepted", type: "fix", tier: "mini" }) + "## Spec (mini)\nx\n## Plan (mini)\ny\n" }, src: ["docs/r.md"], expect: 0 },
    { name: "mini on feat fails", files: { "intent/2026-01-04-nope/intent.md": fm({ status: "Accepted", type: "feat", tier: "mini" }) + "## Spec (mini)\nx\n## Plan (mini)\ny\n" }, src: ["apps/web/z.ts"], expect: "fail" },
    { name: "code without any unit fails", files: {}, src: ["apps/web/w.ts"], expect: "fail" },
  ];
  let failures = 0;
  const saved = { ...CONFIG };
  for (const c of cases) {
    const dir = mkdtempSync(join(tmpdir(), "sdlc-gate-"));
    try {
      const g = (...a) => sh("git", ["-C", dir, ...a]);
      sh("git", ["init", "-q", dir]); g("config", "user.email", "t@t"); g("config", "user.name", "t");
      writeFileSync(join(dir, "base.txt"), "base\n"); g("add", "."); g("commit", "-qm", "base");
      for (const [p, content] of Object.entries(c.files)) { mkdirSync(join(dir, p, ".."), { recursive: true }); writeFileSync(join(dir, p), content); }
      for (const s of c.src) { mkdirSync(join(dir, s, ".."), { recursive: true }); writeFileSync(join(dir, s), "x\n"); }
      g("add", "."); g("commit", "-qm", "unit");
      CONFIG.INTENT_DIR = "intent"; CONFIG.SENSITIVE_PATHS = []; CONFIG.REQUIRE_APPROVED_BY = false;
      const violations = check(Object.keys(c.files).concat(c.src), (p) => (existsSync(join(dir, p)) ? readFileSync(join(dir, p), "utf8") : null));
      const ok = c.expect === 0 ? violations.length === 0 : violations.length > 0;
      console.log(`${ok ? "  ✔" : "  ✖"} self-test: ${c.name} (expected ${c.expect} violation(s), got ${violations.length})`);
      if (!ok) { failures++; for (const x of violations) console.log(`      → ${x}`); }
    } finally { rmSync(dir, { recursive: true, force: true }); }
  }
  Object.assign(CONFIG, saved);
  if (failures) { console.error(`✖ self-test: ${failures} case(s) failed`); process.exit(1); }
  console.log("· check-sdlc: self-test passed");
}

main();
