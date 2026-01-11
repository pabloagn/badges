#!/usr/bin/env node
import { ghQL, user } from "./utils/github.js";
import QuickChart from "quickchart-js";
import fs from "node:fs/promises";

interface Week {
  firstDay: string;                                   // ISO date
  contributionDays: { contributionCount: number }[];
}

const main = async () => {
  const { user: ghUser } = await ghQL<{ user: any }>(`
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
    }`, { login: user });

  if (!ghUser) process.exit(1);

  const thisYear = new Date().getFullYear();          // ▼ filter to current year
  const weeks: Week[] =
    ghUser.contributionsCollection.contributionCalendar.weeks
      .filter((w: Week) => new Date(w.firstDay).getFullYear() === thisYear);

  const labels = weeks.map(w => w.firstDay.slice(0, 10));
  const counts = weeks.map(w =>
    w.contributionDays.reduce((s, d) => s + d.contributionCount, 0)
  );

  const qc = new QuickChart();
  qc.setConfig({
    type: "line",
    data: {
      labels,
      datasets: [{
        data: counts,
        fill: true,
        lineTension: 0.25,
        borderColor: "#7FB4CA",
        backgroundColor: "rgba(127,180,202,0.25)",
        pointRadius: 0,
      }],
    },
    options: {
      legend: { display: false },
      scales: {
        xAxes: [{
          ticks: {
            fontColor: "#ffffff",
            fontSize: 24,
            maxRotation: 45,
            minRotation: 45,
            maxTicksLimit: 12,
            autoSkip: true,
          },
          gridLines: { display: false },
        }],
        yAxes: [{
          ticks: { display: false },
          gridLines: { display: false },
        }],
      },
    },
  })
    .setWidth(2400)
    .setHeight(600)
    .setDevicePixelRatio(2)
    .setBackgroundColor("transparent");

  await fs.mkdir("public/cards", { recursive: true });
  await fs.writeFile(
    "public/cards/contributions.png",
    await qc.toBinary()
  );
};

main();

