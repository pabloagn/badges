import "dotenv/config";
import { Octokit } from "@octokit/core";
import { paginateRest } from "@octokit/plugin-paginate-rest";
import { graphql } from "@octokit/graphql";

const MyOctokit = Octokit.plugin(paginateRest);

const token = process.env.GITHUB_TOKEN;
const user = process.env.GITHUB_ACTOR ?? process.env.GH_USER;

if (!token || !user) {
  console.error(
    "Set both GITHUB_TOKEN and GH_USER (or run inside Actions where GITHUB_ACTOR is defined).",
  );
  process.exit(1);
}

export const octo = new MyOctokit({ auth: token });

export const ghQL = graphql.defaults({
  headers: { authorization: `token ${token}` },
});

export { user };
