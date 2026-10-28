import fs from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

/*
 * Short redirect links for QR codes, read from links.json at the repo root:
 * { "name": "https://destination" } makes /name redirect there.
 * Redirects are temporary (307) so a changed destination works for everyone
 * right away, with nothing cached by browsers.
 */

const LINKS_FILE = path.join(process.cwd(), "links.json");
const NAME = /^[a-z0-9][a-z0-9-]*$/;

/** Pages and other top-level routes a short link must never shadow. */
function reservedNames(): Set<string> {
  const pages = ["desks", "sponsors", "members", "join"];
  // Also any other top-level folder in src/app (such as api), so new pages are covered automatically.
  const appDirs = fs
    .readdirSync(path.join(process.cwd(), "src/app"), { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name.replace(/^\((.*)\)$/, "$1"));
  return new Set([...pages, ...appDirs]);
}

function shortLinks(): { name: string; url: string }[] {
  const raw: unknown = JSON.parse(fs.readFileSync(LINKS_FILE, "utf8"));
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("links.json must be an object mapping short names to URLs.");
  }
  const reserved = reservedNames();
  return Object.entries(raw).map(([name, url]) => {
    if (name === "" || name === "/") {
      throw new Error('links.json: "/" is the home page and can\'t be a short link.');
    }
    if (!NAME.test(name)) {
      throw new Error(`links.json: "${name}" isn't a valid short name. Use lowercase letters, digits and hyphens.`);
    }
    if (reserved.has(name)) {
      throw new Error(`links.json: "/${name}" clashes with an existing page. Pick a different short name.`);
    }
    if (typeof url !== "string" || !/^https?:\/\//.test(url)) {
      throw new Error(`links.json: "${name}" must point to a full http(s) URL.`);
    }
    return { name, url };
  });
}

const links = shortLinks();

const nextConfig: NextConfig = {
  async redirects() {
    return links.map(({ name, url }) => ({ source: `/${name}`, destination: url, permanent: false }));
  },
};

export default nextConfig;
