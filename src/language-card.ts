#!/usr/bin/env node
import { octo, user } from "./utils/github.js";
import QuickChart from "quickchart-js";
import fs from "node:fs/promises";

type LangTally = Record<string, number>;

const fetchLangTotals = async (): Promise<LangTally> => {
  const repos = await octo.paginate("GET /users/{username}/repos", {
    username: user,
    per_page: 100,
  });
  const tally: LangTally = {};

  for (const repo of repos) {
    const data = await octo.request(repo.languages_url);
    Object.entries<number>(data.data).forEach(([lang, bytes]) => {
      tally[lang] = (tally[lang] ?? 0) + bytes;
    });
  }
  return tally;
};

const main = async () => {
  const totals = await fetchLangTotals();
  const sum = Object.values(totals).reduce((a, b) => a + b, 0);
  const labels = Object.keys(totals)
    .sort((a, b) => totals[b] - totals[a])
    .slice(0, 6); // top-6 only

  const data = labels.map((l) => +((100 * totals[l]) / sum).toFixed(1));

  const qc = new QuickChart();
  qc.setConfig({
    type: "horizontalBar",
    data: { labels, datasets: [{ data }] },
    options: {
      legend: { display: false },
      title: { display: false },
      scales: { xAxes: [{ ticks: { callback: (v: any) => v + "%" } }] },
    },
  })
    .setWidth(600)
    .setHeight(150)
    .setBackgroundColor("transparent");

  await fs.mkdir("public/cards", { recursive: true });
  await fs.writeFile("public/cards/languages.png", await qc.toBinary());
};

main();
