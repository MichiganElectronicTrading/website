import type { MetadataRoute } from "next";
import { site } from "@/data/site";

const routes = ["/", "/desks", "/members", "/join", "/sponsors"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((path) => ({ url: new URL(path, site.url).toString() }));
}
