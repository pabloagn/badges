#!/usr/bin/env node
import { octo, user } from "./utils/github.js";
import QuickChart from "quickchart-js";
import fs from "node:fs/promises";

const main = async () => {
  const { data } = await octo.graphql<any>(
    `
    query ($user:String!){
      user(login:$user){
        contributionsCollection {
          contributionCalendar {
            weeks { contributionDays { contributionCount date } }
          }
        }
      }
    }`,
    { user },
  );

  const days = data.user.contributionsCollection.contributionCalendar.weeks
    .flatMap((w: any) => w.contributionDays)
    .slice(-365); // last year

  const labels = days.map((d: any) => d.date);
  const counts = days.map((d: any) => d.contributionCount);

  const qc = new QuickChart();
  qc.setConfig({
    type: "line",
    data: { labels, datasets: [{ data: counts, fill: false }] },
    options: {
      legend: { display: false },
      scales: { xAxes: [{ display: false }], yAxes: [{ display: false }] },
      title: { display: false },
    },
  })
    .setWidth(600)
    .setHeight(120)
    .setBackgroundColor("transparent");

  await fs.mkdir("public/cards", { recursive: true });
  await fs.writeFile("public/cards/contributions.png", await qc.toBinary());
};

main();
