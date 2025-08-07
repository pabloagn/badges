#!/usr/bin/env node
import { ghQL, user } from "./utils/github.js";
import QuickChart from "quickchart-js";
import fs from "node:fs/promises";

interface Week {
  firstDay: string;
  contributionDays: { contributionCount: number }[];
}

const main = async (): Promise<void> => {
  const { user: ghUser } = await ghQL<{ user: any }>(
    `
    query ($login:String!){
      user(login:$login){
        contributionsCollection {
          contributionCalendar {
            weeks {
              firstDay
              contributionDays { contributionCount }
            }
          }
        }
      }
    }`,
    { login: user },
  );

  if (!ghUser) {
    console.error(`User “${user}” not found.`);
    process.exit(1);
  }

  // One point per week → ~52 points
  const weeks: Week[] =
    ghUser.contributionsCollection.contributionCalendar.weeks;

  const labels = weeks.map((w) => w.firstDay);
  const counts = weeks.map((w) =>
    w.contributionDays.reduce((sum, d) => sum + d.contributionCount, 0),
  );

  const qc = new QuickChart();
  qc.setConfig({
    type: "bar",
    data: { labels, datasets: [{ data: counts }] },
    options: {
      legend: { display: false },
      scales: {
        xAxes: [{ display: false }],
        yAxes: [{ display: false }],
      },
      title: { display: false },
    },
  })
    .setWidth(1600) // higher resolution
    .setHeight(240)
    .setBackgroundColor("transparent");

  await fs.mkdir("public/cards", { recursive: true });
  await fs.writeFile("public/cards/contributions.png", await qc.toBinary());
};

main();
