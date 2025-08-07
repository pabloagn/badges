#!/usr/bin/env node
import { ghQL, user } from "./utils/github.js";
import QuickChart from "quickchart-js";
import fs from "node:fs/promises";

interface Day {
  date: string;
  contributionCount: number;
}

const main = async () => {
  const { user: ghUser } = await ghQL<{ user: any }>(
    `
    query ($login:String!){
      user(login:$login){
        contributionsCollection {
          contributionCalendar {
            weeks {
              contributionDays { date contributionCount }
            }
          }
        }
      }
    }`,
    { login: user },
  );

  if (!ghUser) process.exit(1);

  const map = new Map<string, number>();

  ghUser.contributionsCollection.contributionCalendar.weeks.forEach(
    (w: any) => {
      (w.contributionDays as Day[]).forEach((d) => {
        const ym = d.date.slice(0, 7);
        map.set(ym, (map.get(ym) ?? 0) + d.contributionCount);
      });
    },
  );

  const months = Array.from(map.keys()).sort();
  const last12 = months.slice(-12);
  const counts = last12.map((m) => map.get(m) ?? 0);

  const qc = new QuickChart();
  qc.setConfig({
    type: "bar",
    data: { labels: last12, datasets: [{ data: counts }] },
    options: {
      legend: { display: false },
      scales: { xAxes: [{ display: false }], yAxes: [{ display: false }] },
      title: { display: false },
    },
  })
    .setWidth(1600)
    .setHeight(240)
    .setBackgroundColor("transparent");

  await fs.mkdir("public/cards", { recursive: true });
  await fs.writeFile("public/cards/commit_history.png", await qc.toBinary());
};

main();
