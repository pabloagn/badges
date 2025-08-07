#!/usr/bin/env node
import { octo, user } from "./utils/github.js";
import fs from "node:fs/promises";

interface PushEvent {
  repo: { name: string };
  created_at: string;
  payload: { commits: { message: string }[] };
}

/** Writes public/cards/last_commit.svg with your latest PushEvent */
const main = async () => {
  const events: any[] = await (octo as any).paginate(
    "GET /users/{username}/events",
    { username: user, per_page: 100 }
  );

  const push = events.find(e => e.type === "PushEvent") as PushEvent | undefined;
  if (!push) {
    console.error("No recent PushEvent found — skipping.");
    process.exit(1);
  }

  const { repo, created_at, payload } = push;
  const msg = payload.commits[0].message.split("\n")[0];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="60">
  <style>
    .base { font: 400 14px monospace; fill:#ffffff }
    .sub  { font: 400 11px monospace; fill:#9fa4b3 }
  </style>
  <rect width='100%' height='100%' fill='transparent'/>
  <text x='5' y='20' class='base'>Last commit → ${msg}</text>
  <text x='5' y='40' class='sub'>@${repo.name} — ${new Date(created_at).toLocaleString()}</text>
</svg>`;

  await fs.mkdir("public/cards", { recursive: true });
  await fs.writeFile("public/cards/last_commit.svg", svg, "utf8");
};

main();

