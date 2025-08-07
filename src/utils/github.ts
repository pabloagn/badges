import { Octokit } from "@octokit/core";

export const octo = new Octokit({
  auth: process.env.GITHUB_TOKEN, // define in repo secrets
});

export const user = process.env.GITHUB_ACTOR ?? process.env.GH_USER!;
