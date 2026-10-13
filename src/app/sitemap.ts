import { MetadataRoute } from "next";

const BASE_URL = "https://tools.flareprint.me";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${BASE_URL}`,
      lastModified: new Date("2026-09-22T20:52:30.000Z"),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/compress-pdf`,
      lastModified: new Date("2026-09-22T20:12:44.000Z"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/compress-jpg`,
      lastModified: new Date("2026-09-22T20:12:58.000Z"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/jpg-to-pdf`,
      lastModified: new Date("2026-09-22T20:05:16.000Z"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/pdf-to-jpg`,
      lastModified: new Date("2026-09-22T20:05:29.000Z"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/merge-pdf`,
      lastModified: new Date("2026-09-22T20:13:12.000Z"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/split-pdf`,
      lastModified: new Date("2026-09-22T20:13:25.000Z"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/resize-jpg`,
      lastModified: new Date("2026-09-22T20:05:04.000Z"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date("2026-09-22T20:06:23.000Z"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date("2026-09-22T20:06:29.000Z"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date("2026-09-22T20:06:38.000Z"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
