#!/usr/bin/env node
import { octo, user } from "./utils/github.js";
import { LANGUAGE_COLORS, LANGUAGE_ALIASES } from "./language-colors.js";
import { EXCLUDED_LANGUAGES } from "./language-exclude.js";
import QuickChart from "quickchart-js";
import fs from "node:fs/promises";

interface Repo { languages_url: string }
type Tallies = Record<string, number>;

const fetchTotals = async (): Promise<Tallies> => {
  const repos: Repo[] = await (octo as any).paginate(
    "GET /users/{username}/repos",
    { username: user, per_page: 100 }
  );

  const tally: Tallies = {};
  for (const repo of repos) {
    const { data } = await octo.request(repo.languages_url as any);
    for (const [rawLang, bytes] of Object.entries<number>(data)) {
      if (EXCLUDED_LANGUAGES.includes(rawLang)) continue;
      const lang = LANGUAGE_ALIASES[rawLang] ?? rawLang;
      tally[lang] = (tally[lang] ?? 0) + bytes;
    }
  }
  return tally;
};

const main = async () => {
  const totals = await fetchTotals();
  const sum = Object.values(totals).reduce((a, b) => a + b, 0);

  const labels = Object.keys(totals)
    .sort((a, b) => totals[b] - totals[a])
    .slice(0, 10);

  const data   = labels.map(l => +((100 * totals[l]) / sum).toFixed(1));
  const colors = labels.map(l => LANGUAGE_COLORS[l] ?? "#6e7681");

  const qc = new QuickChart();
  qc.setConfig({
    type: "horizontalBar",
    data: { labels, datasets: [{ data, backgroundColor: colors, barThickness: 12 }] },
    options: {
      legend: { display: false },
      scales: {
        xAxes: [{ ticks: { callback: (v: any) => v + "%" } }],
        yAxes: [{ gridLines: { display: false } }],
      },
    },
  })
    .setWidth(1600)
    .setHeight(240)
    .setBackgroundColor("transparent");

  await fs.mkdir("public/cards", { recursive: true });
  await fs.writeFile("public/cards/languages.png", await qc.toBinary());
};

main();

