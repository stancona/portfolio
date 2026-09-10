const LOCALE_COOKIE = { en: "ZW4=", tr: "dHI=" };

const DESIGN_SHOTS = [
  { slug: "", name: "01-overview" },
  { slug: "brand", name: "02-brand-logo" },
  { slug: "colors", name: "03-colors-theme" },
  { slug: "typography", name: "04-typography" },
  { slug: "button", name: "06-button-variants" },
  { slug: "card", name: "10-card-examples" },
  { slug: "table", name: "11-table-data" },
  { slug: "hero", name: "16-hero-cta" },
];

const KEEP_SHOTS = [
  { slug: "", name: "01-home" },
  { slug: "events", name: "02-events" },
  { slug: "tickets", name: "03-tickets-qr" },
  { slug: "league", name: "04-league" },
  { slug: "profile", name: "05-profile" },
];

const ADMIN_SHOTS = [
  { slug: "dashboard", name: "01-dashboard", auth: true },
  { slug: "login", name: "02-login" },
];

module.exports = { LOCALE_COOKIE, DESIGN_SHOTS, KEEP_SHOTS, ADMIN_SHOTS };
