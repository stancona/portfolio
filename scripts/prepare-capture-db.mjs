import { appendFileSync } from "node:fs";
import { createRequire } from "node:module";
import { randomBytes } from "node:crypto";
import postgres from "postgres";

const DATABASE_URL = process.env.DATABASE_URL;
const SESSION_SECRET = process.env.SESSION_SECRET;
const GRIMOIRE_APP_DIR = process.env.GRIMOIRE_APP_DIR;

if (!DATABASE_URL) throw new Error("DATABASE_URL is required");
if (!SESSION_SECRET) throw new Error("SESSION_SECRET is required");
if (!GRIMOIRE_APP_DIR) throw new Error("GRIMOIRE_APP_DIR is required (path to grimoire/apps/app)");

const require = createRequire(import.meta.url);
const cookiePath = require.resolve("remix/cookie", { paths: [GRIMOIRE_APP_DIR] });
const { createCookie } = await import(cookiePath);

const sql = postgres(DATABASE_URL);
const now = new Date();
const daysFromNow = (n) => new Date(now.getTime() + n * 24 * 60 * 60 * 1000);

const [{ count: eventCount }] = await sql`select count(*)::int as count from app.events`;
if (eventCount === 0) {
  const demoEvents = [
    {
      slug: "ejderha-avcisi-turnuvasi",
      category: "ttrpg",
      format: "tournament_swiss",
      title: "Ejderha Avcısı Turnuvası",
      description: "Üç tur İsviçre sistemi TTRPG turnuvası. Seviye 5 hazır karakterlerle katılın.",
      eventDate: daysFromNow(7),
      venue: "Stancona Oyun Salonu",
      status: "registration_open",
    },
    {
      slug: "sisli-orman-gecesi",
      category: "ttrpg",
      format: "oneshot_day",
      title: "Sisli Orman Gecesi",
      description: "Tek gecelik korku temalı one-shot macera. Başlangıç seviyesi dostu.",
      eventDate: daysFromNow(14),
      venue: "Stancona Oyun Salonu",
      status: "registration_open",
    },
    {
      slug: "geek-quiz-savaslari",
      category: "social",
      format: "quiz_hosted",
      title: "Geek Quiz Savaşları",
      description: "Fantastik evrenler bilgi yarışması. Takımını kur, kupayı kap.",
      eventDate: daysFromNow(21),
      venue: "Stancona Kafe",
      status: "published",
    },
  ];
  for (const ev of demoEvents) {
    await sql`
      insert into app.events (slug, category, format, title, description, event_date, venue, status)
      values (${ev.slug}, ${ev.category}, ${ev.format}, ${ev.title}, ${ev.description}, ${ev.eventDate}, ${ev.venue}, ${ev.status})
    `;
  }
  console.log(`seeded ${demoEvents.length} demo events`);
}

let [adminUser] = await sql`select id from app.users where email = 'admin@stancona.org' limit 1`;
if (!adminUser) {
  [adminUser] = await sql`
    insert into app.users (email, username, name, ttrpg_experience, is_active)
    values ('showcase@stancona.org', 'showcase', 'Showcase Admin', 5, true)
    returning id
  `;
  console.log("created showcase@stancona.org");
}
const [adminRole] = await sql`select id from app.roles where key = 'admin' limit 1`;
if (adminRole) {
  await sql`
    insert into app.user_roles (user_id, role_id)
    values (${adminUser.id}, ${adminRole.id})
    on conflict do nothing
  `;
}

const [demoEvent] = await sql`select id from app.events order by event_date asc limit 1`;
if (demoEvent) {
  const [{ count: ticketCount }] = await sql`select count(*)::int as count from app.tickets where event_id = ${demoEvent.id}`;
  if (ticketCount === 0) {
    await sql`
      insert into app.tickets (user_id, event_id, order_id, holder_name, holder_email, qr_token, status, issued_at, verified_at)
      values
        (${adminUser.id}, ${demoEvent.id}, 'ORD-2026-0001', 'Showcase Admin', 'showcase@stancona.org', ${randomBytes(32).toString("hex")}, 'active', ${now}, ${now}),
        (${adminUser.id}, ${demoEvent.id}, 'ORD-2026-0002', 'Showcase Admin', 'showcase@stancona.org', ${randomBytes(32).toString("hex")}, 'active', ${now}, null)
    `;
    console.log("seeded 2 demo tickets (1 checked in today)");
  }
}

await sql`delete from app.sessions where user_id = ${adminUser.id}`;
const token = randomBytes(32).toString("hex");
await sql`
  insert into app.sessions (user_id, token, data, expires_at, last_seen_at)
  values (${adminUser.id}, ${token}, ${JSON.stringify([{ auth: { userId: adminUser.id } }, {}])}, ${daysFromNow(30)}, ${now})
`;

const sessionCookie = createCookie("stancona_session", {
  secrets: [SESSION_SECRET],
  httpOnly: true,
  sameSite: "Lax",
  path: "/",
  maxAge: 30 * 24 * 60 * 60,
});
const header = await sessionCookie.serialize(token);
const signedValue = header.split(";")[0].split("=").slice(1).join("=");

await sql.end();

const result = { sessionCookie: signedValue, sessionToken: token };
console.log(JSON.stringify(result));
if (process.env.GITHUB_ENV) {
  appendFileSync(process.env.GITHUB_ENV, `SHOWCASE_SESSION=${signedValue}\nSHOWCASE_TOKEN=${token}\n`);
}
