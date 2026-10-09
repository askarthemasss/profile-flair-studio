import type { SigilProfile } from "./profile";

/**
 * Built-in sample pack.
 *
 * Public stats for the most-followed GitHub developer, Linus Torvalds
 * (@torvalds), frozen on 2026-10-09. The live API does not serve this object
 * for any other login.
 *
 * `commits` is that year's public contribution total. `prsMerged`, `reviews`,
 * and `issues` are public search totals: merged pull requests he authored,
 * pull requests he reviewed, and issues he opened.
 */
export const DEMO_PROFILE: SigilProfile = {
  username: "torvalds",
  name: "Linus Torvalds",
  bio: "GitHub profile",
  contributions: 3796,
  repos: 12,
  stars: 263472,
  followers: 326925,
  rankPercent: 1,
  streakCurrent: 102,
  streakBest: 102,
  commits: 3796,
  prsMerged: 72,
  reviews: 34,
  issues: 10,
  languages: [
    {
      name: "C",
      pct: 89,
    },
    {
      name: "OpenSCAD",
      pct: 11,
    },
  ],
  heatmap: [
    1, 4, 4, 4, 2, 3, 1, 1, 2, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2,
    1, 2, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 0, 1, 2, 1, 2, 2, 1, 1, 1, 2, 2, 1, 1, 2, 1, 2, 2, 1, 1,
    4, 4, 3, 2, 1, 1, 1, 1, 2, 1, 2, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 3, 2, 3, 4, 2, 2, 3, 4, 4, 1, 2, 1, 1, 1, 3, 2, 1, 1, 2, 1, 2, 3,
    4, 3, 3, 2, 1, 2, 2, 2, 1, 1, 2, 1, 1, 3, 2, 1, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 4,
    2, 2, 1, 2, 1, 4, 2, 1, 1, 1, 2, 1, 2, 4, 3, 2, 1, 1, 1, 1, 1, 0,
  ],
  activity: [56, 158, 199, 103, 175, 72, 95, 59, 96, 110, 137, 41],
  achievements: [
    {
      name: "Commit Marathoner",
      earned: true,
    },
    {
      name: "Streakkeeper",
      earned: true,
    },
    {
      name: "Open Source Patron",
      earned: true,
    },
    {
      name: "Architect",
      earned: false,
    },
  ],
  repo: {
    name: "torvalds/linux",
    description: "Linux kernel source tree",
    stars: 251353,
    forks: 67202,
    language: "C",
  },
  days: [
    {
      date: "2025-10-05",
      count: 10,
    },
    {
      date: "2025-10-12",
      count: 3,
    },
    {
      date: "2025-10-19",
      count: 4,
    },
    {
      date: "2025-10-26",
      count: 10,
    },
    {
      date: "2025-11-02",
      count: 1,
    },
    {
      date: "2025-11-09",
      count: 3,
    },
    {
      date: "2025-11-16",
      count: 5,
    },
    {
      date: "2025-11-23",
      count: 7,
    },
    {
      date: "2025-11-30",
      count: 2,
    },
    {
      date: "2025-12-07",
      count: 3,
    },
    {
      date: "2025-12-14",
      count: 8,
    },
    {
      date: "2025-12-21",
      count: 7,
    },
    {
      date: "2025-12-28",
      count: 10,
    },
    {
      date: "2026-01-04",
      count: 7,
    },
    {
      date: "2026-01-11",
      count: 7,
    },
    {
      date: "2026-01-18",
      count: 26,
    },
    {
      date: "2026-01-25",
      count: 12,
    },
    {
      date: "2026-02-01",
      count: 6,
    },
    {
      date: "2026-02-08",
      count: 2,
    },
    {
      date: "2026-02-15",
      count: 7,
    },
    {
      date: "2026-02-22",
      count: 6,
    },
    {
      date: "2026-03-01",
      count: 10,
    },
    {
      date: "2026-03-08",
      count: 3,
    },
    {
      date: "2026-03-15",
      count: 11,
    },
    {
      date: "2026-03-22",
      count: 9,
    },
    {
      date: "2026-03-29",
      count: 13,
    },
    {
      date: "2026-04-05",
      count: 11,
    },
    {
      date: "2026-04-12",
      count: 8,
    },
    {
      date: "2026-04-19",
      count: 6,
    },
    {
      date: "2026-04-26",
      count: 3,
    },
    {
      date: "2026-05-03",
      count: 6,
    },
    {
      date: "2026-05-10",
      count: 3,
    },
    {
      date: "2026-05-17",
      count: 9,
    },
    {
      date: "2026-05-24",
      count: 10,
    },
    {
      date: "2026-05-31",
      count: 20,
    },
    {
      date: "2026-06-07",
      count: 9,
    },
    {
      date: "2026-06-14",
      count: 2,
    },
    {
      date: "2026-06-21",
      count: 8,
    },
    {
      date: "2026-06-28",
      count: 3,
    },
    {
      date: "2026-07-05",
      count: 7,
    },
    {
      date: "2026-07-12",
      count: 9,
    },
    {
      date: "2026-07-19",
      count: 7,
    },
    {
      date: "2026-07-26",
      count: 13,
    },
    {
      date: "2026-08-02",
      count: 35,
    },
    {
      date: "2026-08-09",
      count: 11,
    },
    {
      date: "2026-08-16",
      count: 15,
    },
    {
      date: "2026-08-23",
      count: 12,
    },
    {
      date: "2026-08-30",
      count: 10,
    },
    {
      date: "2026-09-06",
      count: 10,
    },
    {
      date: "2026-09-13",
      count: 13,
    },
    {
      date: "2026-09-20",
      count: 14,
    },
    {
      date: "2026-09-27",
      count: 10,
    },
    {
      date: "2026-10-04",
      count: 13,
    },
    {
      date: "2025-10-06",
      count: 11,
    },
    {
      date: "2025-10-13",
      count: 0,
    },
    {
      date: "2025-10-20",
      count: 2,
    },
    {
      date: "2025-10-27",
      count: 1,
    },
    {
      date: "2025-11-03",
      count: 0,
    },
    {
      date: "2025-11-10",
      count: 2,
    },
    {
      date: "2025-11-17",
      count: 3,
    },
    {
      date: "2025-11-24",
      count: 3,
    },
    {
      date: "2025-12-01",
      count: 24,
    },
    {
      date: "2025-12-08",
      count: 2,
    },
    {
      date: "2025-12-15",
      count: 0,
    },
    {
      date: "2025-12-22",
      count: 2,
    },
    {
      date: "2025-12-29",
      count: 3,
    },
    {
      date: "2026-01-05",
      count: 3,
    },
    {
      date: "2026-01-12",
      count: 3,
    },
    {
      date: "2026-01-19",
      count: 10,
    },
    {
      date: "2026-01-26",
      count: 2,
    },
    {
      date: "2026-02-02",
      count: 2,
    },
    {
      date: "2026-02-09",
      count: 47,
    },
    {
      date: "2026-02-16",
      count: 10,
    },
    {
      date: "2026-02-23",
      count: 2,
    },
    {
      date: "2026-03-02",
      count: 1,
    },
    {
      date: "2026-03-09",
      count: 0,
    },
    {
      date: "2026-03-16",
      count: 2,
    },
    {
      date: "2026-03-23",
      count: 1,
    },
    {
      date: "2026-03-30",
      count: 5,
    },
    {
      date: "2026-04-06",
      count: 1,
    },
    {
      date: "2026-04-13",
      count: 41,
    },
    {
      date: "2026-04-20",
      count: 16,
    },
    {
      date: "2026-04-27",
      count: 7,
    },
    {
      date: "2026-05-04",
      count: 2,
    },
    {
      date: "2026-05-11",
      count: 1,
    },
    {
      date: "2026-05-18",
      count: 3,
    },
    {
      date: "2026-05-25",
      count: 3,
    },
    {
      date: "2026-06-01",
      count: 13,
    },
    {
      date: "2026-06-08",
      count: 6,
    },
    {
      date: "2026-06-15",
      count: 46,
    },
    {
      date: "2026-06-22",
      count: 11,
    },
    {
      date: "2026-06-29",
      count: 0,
    },
    {
      date: "2026-07-06",
      count: 1,
    },
    {
      date: "2026-07-13",
      count: 6,
    },
    {
      date: "2026-07-20",
      count: 3,
    },
    {
      date: "2026-07-27",
      count: 26,
    },
    {
      date: "2026-08-03",
      count: 65,
    },
    {
      date: "2026-08-10",
      count: 32,
    },
    {
      date: "2026-08-17",
      count: 25,
    },
    {
      date: "2026-08-24",
      count: 12,
    },
    {
      date: "2026-08-31",
      count: 24,
    },
    {
      date: "2026-09-07",
      count: 9,
    },
    {
      date: "2026-09-14",
      count: 6,
    },
    {
      date: "2026-09-21",
      count: 1,
    },
    {
      date: "2026-09-28",
      count: 11,
    },
    {
      date: "2026-10-05",
      count: 9,
    },
    {
      date: "2025-10-07",
      count: 13,
    },
    {
      date: "2025-10-14",
      count: 4,
    },
    {
      date: "2025-10-21",
      count: 1,
    },
    {
      date: "2025-10-28",
      count: 2,
    },
    {
      date: "2025-11-04",
      count: 3,
    },
    {
      date: "2025-11-11",
      count: 3,
    },
    {
      date: "2025-11-18",
      count: 2,
    },
    {
      date: "2025-11-25",
      count: 3,
    },
    {
      date: "2025-12-02",
      count: 33,
    },
    {
      date: "2025-12-09",
      count: 10,
    },
    {
      date: "2025-12-16",
      count: 5,
    },
    {
      date: "2025-12-23",
      count: 2,
    },
    {
      date: "2025-12-30",
      count: 4,
    },
    {
      date: "2026-01-06",
      count: 2,
    },
    {
      date: "2026-01-13",
      count: 12,
    },
    {
      date: "2026-01-20",
      count: 9,
    },
    {
      date: "2026-01-27",
      count: 1,
    },
    {
      date: "2026-02-03",
      count: 3,
    },
    {
      date: "2026-02-10",
      count: 45,
    },
    {
      date: "2026-02-17",
      count: 15,
    },
    {
      date: "2026-02-24",
      count: 2,
    },
    {
      date: "2026-03-03",
      count: 3,
    },
    {
      date: "2026-03-10",
      count: 2,
    },
    {
      date: "2026-03-17",
      count: 3,
    },
    {
      date: "2026-03-24",
      count: 6,
    },
    {
      date: "2026-03-31",
      count: 4,
    },
    {
      date: "2026-04-07",
      count: 3,
    },
    {
      date: "2026-04-14",
      count: 41,
    },
    {
      date: "2026-04-21",
      count: 11,
    },
    {
      date: "2026-04-28",
      count: 1,
    },
    {
      date: "2026-05-05",
      count: 8,
    },
    {
      date: "2026-05-12",
      count: 1,
    },
    {
      date: "2026-05-19",
      count: 6,
    },
    {
      date: "2026-05-26",
      count: 3,
    },
    {
      date: "2026-06-02",
      count: 8,
    },
    {
      date: "2026-06-09",
      count: 13,
    },
    {
      date: "2026-06-16",
      count: 46,
    },
    {
      date: "2026-06-23",
      count: 22,
    },
    {
      date: "2026-06-30",
      count: 1,
    },
    {
      date: "2026-07-07",
      count: 1,
    },
    {
      date: "2026-07-14",
      count: 3,
    },
    {
      date: "2026-07-21",
      count: 7,
    },
    {
      date: "2026-07-28",
      count: 20,
    },
    {
      date: "2026-08-04",
      count: 54,
    },
    {
      date: "2026-08-11",
      count: 23,
    },
    {
      date: "2026-08-18",
      count: 46,
    },
    {
      date: "2026-08-25",
      count: 12,
    },
    {
      date: "2026-09-01",
      count: 18,
    },
    {
      date: "2026-09-08",
      count: 4,
    },
    {
      date: "2026-09-15",
      count: 5,
    },
    {
      date: "2026-09-22",
      count: 14,
    },
    {
      date: "2026-09-29",
      count: 23,
    },
    {
      date: "2026-10-06",
      count: 6,
    },
    {
      date: "2025-10-08",
      count: 6,
    },
    {
      date: "2025-10-15",
      count: 6,
    },
    {
      date: "2025-10-22",
      count: 5,
    },
    {
      date: "2025-10-29",
      count: 0,
    },
    {
      date: "2025-11-05",
      count: 4,
    },
    {
      date: "2025-11-12",
      count: 4,
    },
    {
      date: "2025-11-19",
      count: 4,
    },
    {
      date: "2025-11-26",
      count: 8,
    },
    {
      date: "2025-12-03",
      count: 36,
    },
    {
      date: "2025-12-10",
      count: 10,
    },
    {
      date: "2025-12-17",
      count: 2,
    },
    {
      date: "2025-12-24",
      count: 3,
    },
    {
      date: "2025-12-31",
      count: 6,
    },
    {
      date: "2026-01-07",
      count: 11,
    },
    {
      date: "2026-01-14",
      count: 5,
    },
    {
      date: "2026-01-21",
      count: 13,
    },
    {
      date: "2026-01-28",
      count: 1,
    },
    {
      date: "2026-02-04",
      count: 5,
    },
    {
      date: "2026-02-11",
      count: 28,
    },
    {
      date: "2026-02-18",
      count: 8,
    },
    {
      date: "2026-02-25",
      count: 3,
    },
    {
      date: "2026-03-04",
      count: 5,
    },
    {
      date: "2026-03-11",
      count: 2,
    },
    {
      date: "2026-03-18",
      count: 5,
    },
    {
      date: "2026-03-25",
      count: 4,
    },
    {
      date: "2026-04-01",
      count: 0,
    },
    {
      date: "2026-04-08",
      count: 2,
    },
    {
      date: "2026-04-15",
      count: 37,
    },
    {
      date: "2026-04-22",
      count: 9,
    },
    {
      date: "2026-04-29",
      count: 2,
    },
    {
      date: "2026-05-06",
      count: 4,
    },
    {
      date: "2026-05-13",
      count: 16,
    },
    {
      date: "2026-05-20",
      count: 2,
    },
    {
      date: "2026-05-27",
      count: 0,
    },
    {
      date: "2026-06-03",
      count: 3,
    },
    {
      date: "2026-06-10",
      count: 8,
    },
    {
      date: "2026-06-17",
      count: 26,
    },
    {
      date: "2026-06-24",
      count: 11,
    },
    {
      date: "2026-07-01",
      count: 1,
    },
    {
      date: "2026-07-08",
      count: 1,
    },
    {
      date: "2026-07-15",
      count: 2,
    },
    {
      date: "2026-07-22",
      count: 9,
    },
    {
      date: "2026-07-29",
      count: 29,
    },
    {
      date: "2026-08-05",
      count: 9,
    },
    {
      date: "2026-08-12",
      count: 6,
    },
    {
      date: "2026-08-19",
      count: 35,
    },
    {
      date: "2026-08-26",
      count: 10,
    },
    {
      date: "2026-09-02",
      count: 2,
    },
    {
      date: "2026-09-09",
      count: 6,
    },
    {
      date: "2026-09-16",
      count: 2,
    },
    {
      date: "2026-09-23",
      count: 9,
    },
    {
      date: "2026-09-30",
      count: 9,
    },
    {
      date: "2026-10-07",
      count: 5,
    },
    {
      date: "2025-10-09",
      count: 5,
    },
    {
      date: "2025-10-16",
      count: 5,
    },
    {
      date: "2025-10-23",
      count: 6,
    },
    {
      date: "2025-10-30",
      count: 6,
    },
    {
      date: "2025-11-06",
      count: 8,
    },
    {
      date: "2025-11-13",
      count: 9,
    },
    {
      date: "2025-11-20",
      count: 7,
    },
    {
      date: "2025-11-27",
      count: 8,
    },
    {
      date: "2025-12-04",
      count: 34,
    },
    {
      date: "2025-12-11",
      count: 8,
    },
    {
      date: "2025-12-18",
      count: 0,
    },
    {
      date: "2025-12-25",
      count: 1,
    },
    {
      date: "2026-01-01",
      count: 4,
    },
    {
      date: "2026-01-08",
      count: 11,
    },
    {
      date: "2026-01-15",
      count: 7,
    },
    {
      date: "2026-01-22",
      count: 5,
    },
    {
      date: "2026-01-29",
      count: 6,
    },
    {
      date: "2026-02-05",
      count: 6,
    },
    {
      date: "2026-02-12",
      count: 25,
    },
    {
      date: "2026-02-19",
      count: 2,
    },
    {
      date: "2026-02-26",
      count: 10,
    },
    {
      date: "2026-03-05",
      count: 5,
    },
    {
      date: "2026-03-12",
      count: 6,
    },
    {
      date: "2026-03-19",
      count: 5,
    },
    {
      date: "2026-03-26",
      count: 8,
    },
    {
      date: "2026-04-02",
      count: 9,
    },
    {
      date: "2026-04-09",
      count: 9,
    },
    {
      date: "2026-04-16",
      count: 13,
    },
    {
      date: "2026-04-23",
      count: 10,
    },
    {
      date: "2026-04-30",
      count: 6,
    },
    {
      date: "2026-05-07",
      count: 6,
    },
    {
      date: "2026-05-14",
      count: 4,
    },
    {
      date: "2026-05-21",
      count: 6,
    },
    {
      date: "2026-05-28",
      count: 9,
    },
    {
      date: "2026-06-04",
      count: 4,
    },
    {
      date: "2026-06-11",
      count: 12,
    },
    {
      date: "2026-06-18",
      count: 20,
    },
    {
      date: "2026-06-25",
      count: 16,
    },
    {
      date: "2026-07-02",
      count: 7,
    },
    {
      date: "2026-07-09",
      count: 2,
    },
    {
      date: "2026-07-16",
      count: 7,
    },
    {
      date: "2026-07-23",
      count: 5,
    },
    {
      date: "2026-07-30",
      count: 40,
    },
    {
      date: "2026-08-06",
      count: 17,
    },
    {
      date: "2026-08-13",
      count: 9,
    },
    {
      date: "2026-08-20",
      count: 32,
    },
    {
      date: "2026-08-27",
      count: 10,
    },
    {
      date: "2026-09-03",
      count: 25,
    },
    {
      date: "2026-09-10",
      count: 10,
    },
    {
      date: "2026-09-17",
      count: 6,
    },
    {
      date: "2026-09-24",
      count: 42,
    },
    {
      date: "2026-10-01",
      count: 15,
    },
    {
      date: "2026-10-08",
      count: 7,
    },
    {
      date: "2025-10-10",
      count: 19,
    },
    {
      date: "2025-10-17",
      count: 8,
    },
    {
      date: "2025-10-24",
      count: 13,
    },
    {
      date: "2025-10-31",
      count: 10,
    },
    {
      date: "2025-11-07",
      count: 9,
    },
    {
      date: "2025-11-14",
      count: 15,
    },
    {
      date: "2025-11-21",
      count: 9,
    },
    {
      date: "2025-11-28",
      count: 11,
    },
    {
      date: "2025-12-05",
      count: 33,
    },
    {
      date: "2025-12-12",
      count: 6,
    },
    {
      date: "2025-12-19",
      count: 9,
    },
    {
      date: "2025-12-26",
      count: 10,
    },
    {
      date: "2026-01-02",
      count: 16,
    },
    {
      date: "2026-01-09",
      count: 15,
    },
    {
      date: "2026-01-16",
      count: 14,
    },
    {
      date: "2026-01-23",
      count: 17,
    },
    {
      date: "2026-01-30",
      count: 7,
    },
    {
      date: "2026-02-06",
      count: 10,
    },
    {
      date: "2026-02-13",
      count: 9,
    },
    {
      date: "2026-02-20",
      count: 21,
    },
    {
      date: "2026-02-27",
      count: 11,
    },
    {
      date: "2026-03-06",
      count: 19,
    },
    {
      date: "2026-03-13",
      count: 16,
    },
    {
      date: "2026-03-20",
      count: 15,
    },
    {
      date: "2026-03-27",
      count: 18,
    },
    {
      date: "2026-04-03",
      count: 11,
    },
    {
      date: "2026-04-10",
      count: 6,
    },
    {
      date: "2026-04-17",
      count: 27,
    },
    {
      date: "2026-04-24",
      count: 24,
    },
    {
      date: "2026-05-01",
      count: 11,
    },
    {
      date: "2026-05-08",
      count: 13,
    },
    {
      date: "2026-05-15",
      count: 22,
    },
    {
      date: "2026-05-22",
      count: 26,
    },
    {
      date: "2026-05-29",
      count: 16,
    },
    {
      date: "2026-06-05",
      count: 12,
    },
    {
      date: "2026-06-12",
      count: 13,
    },
    {
      date: "2026-06-19",
      count: 11,
    },
    {
      date: "2026-06-26",
      count: 16,
    },
    {
      date: "2026-07-03",
      count: 9,
    },
    {
      date: "2026-07-10",
      count: 11,
    },
    {
      date: "2026-07-17",
      count: 11,
    },
    {
      date: "2026-07-24",
      count: 19,
    },
    {
      date: "2026-07-31",
      count: 17,
    },
    {
      date: "2026-08-07",
      count: 9,
    },
    {
      date: "2026-08-14",
      count: 17,
    },
    {
      date: "2026-08-21",
      count: 13,
    },
    {
      date: "2026-08-28",
      count: 14,
    },
    {
      date: "2026-09-04",
      count: 10,
    },
    {
      date: "2026-09-11",
      count: 11,
    },
    {
      date: "2026-09-18",
      count: 42,
    },
    {
      date: "2026-09-25",
      count: 22,
    },
    {
      date: "2026-10-02",
      count: 36,
    },
    {
      date: "2026-10-09",
      count: 1,
    },
    {
      date: "2025-10-11",
      count: 10,
    },
    {
      date: "2025-10-18",
      count: 12,
    },
    {
      date: "2025-10-25",
      count: 4,
    },
    {
      date: "2025-11-01",
      count: 8,
    },
    {
      date: "2025-11-08",
      count: 9,
    },
    {
      date: "2025-11-15",
      count: 5,
    },
    {
      date: "2025-11-22",
      count: 7,
    },
    {
      date: "2025-11-29",
      count: 1,
    },
    {
      date: "2025-12-06",
      count: 28,
    },
    {
      date: "2025-12-13",
      count: 13,
    },
    {
      date: "2025-12-20",
      count: 16,
    },
    {
      date: "2025-12-27",
      count: 8,
    },
    {
      date: "2026-01-03",
      count: 3,
    },
    {
      date: "2026-01-10",
      count: 4,
    },
    {
      date: "2026-01-17",
      count: 10,
    },
    {
      date: "2026-01-24",
      count: 10,
    },
    {
      date: "2026-01-31",
      count: 4,
    },
    {
      date: "2026-02-07",
      count: 5,
    },
    {
      date: "2026-02-14",
      count: 9,
    },
    {
      date: "2026-02-21",
      count: 13,
    },
    {
      date: "2026-02-28",
      count: 6,
    },
    {
      date: "2026-03-07",
      count: 12,
    },
    {
      date: "2026-03-14",
      count: 6,
    },
    {
      date: "2026-03-21",
      count: 4,
    },
    {
      date: "2026-03-28",
      count: 4,
    },
    {
      date: "2026-04-04",
      count: 1,
    },
    {
      date: "2026-04-11",
      count: 7,
    },
    {
      date: "2026-04-18",
      count: 7,
    },
    {
      date: "2026-04-25",
      count: 6,
    },
    {
      date: "2026-05-02",
      count: 2,
    },
    {
      date: "2026-05-09",
      count: 8,
    },
    {
      date: "2026-05-16",
      count: 2,
    },
    {
      date: "2026-05-23",
      count: 11,
    },
    {
      date: "2026-05-30",
      count: 10,
    },
    {
      date: "2026-06-06",
      count: 13,
    },
    {
      date: "2026-06-13",
      count: 3,
    },
    {
      date: "2026-06-20",
      count: 7,
    },
    {
      date: "2026-06-27",
      count: 6,
    },
    {
      date: "2026-07-04",
      count: 2,
    },
    {
      date: "2026-07-11",
      count: 7,
    },
    {
      date: "2026-07-18",
      count: 4,
    },
    {
      date: "2026-07-25",
      count: 6,
    },
    {
      date: "2026-08-01",
      count: 13,
    },
    {
      date: "2026-08-08",
      count: 10,
    },
    {
      date: "2026-08-15",
      count: 5,
    },
    {
      date: "2026-08-22",
      count: 9,
    },
    {
      date: "2026-08-29",
      count: 2,
    },
    {
      date: "2026-09-05",
      count: 6,
    },
    {
      date: "2026-09-12",
      count: 9,
    },
    {
      date: "2026-09-19",
      count: 22,
    },
    {
      date: "2026-09-26",
      count: 8,
    },
    {
      date: "2026-10-03",
      count: 33,
    },
  ],
  asOf: "2026-10-09T12:00:00Z",
  languageBytes: [
    {
      name: "C",
      bytes: 89,
    },
    {
      name: "OpenSCAD",
      bytes: 11,
    },
  ],
  topRepos: [
    {
      name: "torvalds/linux",
      description: "Linux kernel source tree",
      stars: 251353,
      forks: 67202,
      language: "C",
      pushedAt: "2026-10-09T04:46:28Z",
    },
    {
      name: "torvalds/AudioNoise",
      description: "Random digital audio effects",
      stars: 4509,
      forks: 224,
      language: "C",
      pushedAt: "2026-05-08T17:20:22Z",
    },
    {
      name: "torvalds/GuitarPedal",
      description: "Linus learns analog circuits",
      stars: 2441,
      forks: 124,
      language: "C",
      pushedAt: "2026-10-05T22:45:45Z",
    },
    {
      name: "torvalds/uemacs",
      description: "Random version of microemacs with my private modificatons",
      stars: 2164,
      forks: 326,
      language: "C",
      pushedAt: "2026-08-06T18:30:25Z",
    },
    {
      name: "torvalds/test-tlb",
      description: "Stupid memory latency and TLB tester",
      stars: 1071,
      forks: 223,
      language: "C",
      pushedAt: "2024-08-19T21:13:36Z",
    },
    {
      name: "torvalds/pesconvert",
      description: "Brother PES file converter",
      stars: 585,
      forks: 74,
      language: "C",
      pushedAt: "2022-12-22T10:46:37Z",
    },
    {
      name: "torvalds/1590A",
      description: "Random odd guitar pedal design in kicad",
      stars: 578,
      forks: 22,
      language: "OpenSCAD",
      pushedAt: "2025-09-19T02:54:14Z",
    },
    {
      name: "torvalds/HunspellColorize",
      description: "Wrapper around 'less' to colorize spelling mistakes using Hunspell",
      stars: 390,
      forks: 22,
      language: "C",
      pushedAt: "2026-01-19T20:23:09Z",
    },
    {
      name: "torvalds/ScrollWheel",
      description: "Minimalist RP2350 magnetic sensor scroll wheel toy project",
      stars: 381,
      forks: 14,
      language: "C",
      pushedAt: "2026-06-02T15:52:37Z",
    },
  ],
  avatarDataUri:
    "data:image/jpeg;base64,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",
};
