#!/usr/bin/env bun
/**
 * PR Status Script
 * Fetches open PRs for a repository with review comments and status info.
 *
 * Usage:
 *   bun pr-status.ts [--repo org/repo]
 *
 * If --repo is omitted, uses the current repository.
 */

import { $ } from "bun";

interface ReviewThread {
	isResolved: boolean;
	comments: { body: string; author: { login: string } }[];
}

interface PR {
	number: number;
	title: string;
	url: string;
	isDraft: boolean;
	author: { login: string };
	headRefName: string;
	createdAt: string;
	updatedAt: string;
	reviewDecision: string | null;
	statusCheckRollup: {
		state: string;
		contexts: { name: string; state: string; conclusion: string | null }[];
	} | null;
	reviewThreads: { nodes: ReviewThread[] };
}

interface PRResponse {
	number: number;
	title: string;
	url: string;
	isDraft: boolean;
	author: { login: string };
	headRefName: string;
	createdAt: string;
	updatedAt: string;
	reviewDecision: string | null;
	commits: {
		nodes: {
			commit: {
				statusCheckRollup: {
					state: string;
					contexts: {
						nodes: { name: string; state: string; conclusion: string | null }[];
					};
				} | null;
			};
		}[];
	};
	reviewThreads: { nodes: ReviewThread[] };
}

function parseArgs(): { repo: string | null } {
	const args = process.argv.slice(2);
	let repo: string | null = null;

	for (let i = 0; i < args.length; i++) {
		if (args[i] === "--repo" && args[i + 1]) {
			repo = args[i + 1];
			i++;
		}
	}

	return { repo };
}

async function getRepo(specified: string | null): Promise<string> {
	if (specified) return specified;

	const result =
		await $`gh repo view --json nameWithOwner -q '.nameWithOwner'`.text();
	return result.trim();
}

async function fetchPRs(repo: string): Promise<PR[]> {
	const query = `
    query($repo: String!, $owner: String!) {
      repository(name: $repo, owner: $owner) {
        pullRequests(first: 50, states: OPEN, orderBy: {field: UPDATED_AT, direction: DESC}) {
          nodes {
            number
            title
            url
            isDraft
            author { login }
            headRefName
            createdAt
            updatedAt
            reviewDecision
            commits(last: 1) {
              nodes {
                commit {
                  statusCheckRollup {
                    state
                    contexts(first: 20) {
                      nodes {
                        ... on CheckRun {
                          name
                          conclusion
                          status
                        }
                        ... on StatusContext {
                          context
                          state
                        }
                      }
                    }
                  }
                }
              }
            }
            reviewThreads(first: 50) {
              nodes {
                isResolved
                comments(first: 1) {
                  nodes {
                    body
                    author { login }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

	const [owner, name] = repo.split("/");
	const result =
		await $`gh api graphql -f query=${query} -f owner=${owner} -f repo=${name}`.json();

	const prs = result.data.repository.pullRequests.nodes as PRResponse[];

	return prs.map((pr) => ({
		number: pr.number,
		title: pr.title,
		url: pr.url,
		isDraft: pr.isDraft,
		author: pr.author,
		headRefName: pr.headRefName,
		createdAt: pr.createdAt,
		updatedAt: pr.updatedAt,
		reviewDecision: pr.reviewDecision,
		statusCheckRollup: pr.commits.nodes[0]?.commit.statusCheckRollup
			? {
					state: pr.commits.nodes[0].commit.statusCheckRollup.state,
					contexts:
						pr.commits.nodes[0].commit.statusCheckRollup.contexts.nodes.map(
							(ctx: Record<string, unknown>) => ({
								name: (ctx.name as string) || (ctx.context as string) || "",
								state: (ctx.status as string) || (ctx.state as string) || "",
								conclusion: (ctx.conclusion as string) || null,
							}),
						),
				}
			: null,
		reviewThreads: pr.reviewThreads,
	}));
}

function formatStatus(pr: PR): string {
	if (!pr.statusCheckRollup) return "none";

	const state = pr.statusCheckRollup.state;
	switch (state) {
		case "SUCCESS":
			return "passing";
		case "FAILURE":
		case "ERROR":
			return "failing";
		case "PENDING":
			return "pending";
		default:
			return state.toLowerCase();
	}
}

function formatReviewDecision(decision: string | null): string {
	if (!decision) return "pending";
	switch (decision) {
		case "APPROVED":
			return "approved";
		case "CHANGES_REQUESTED":
			return "changes requested";
		case "REVIEW_REQUIRED":
			return "review required";
		default:
			return decision.toLowerCase();
	}
}

function countUnresolvedThreads(pr: PR): number {
	return pr.reviewThreads.nodes.filter((t) => !t.isResolved).length;
}

function formatOutput(repo: string, prs: PR[]): void {
	console.log(`\n## PR Status: ${repo}\n`);
	console.log(`**Open PRs:** ${prs.length}\n`);

	if (prs.length === 0) {
		console.log("No open pull requests.");
		return;
	}

	console.log(
		"| # | Title | Author | State | Checks | Review | Unresolved |",
	);
	console.log(
		"|---|-------|--------|-------|--------|--------|------------|",
	);

	for (const pr of prs) {
		const title =
			pr.title.length > 40 ? `${pr.title.slice(0, 37)}...` : pr.title;
		const state = pr.isDraft ? "draft" : "ready";
		const unresolved = countUnresolvedThreads(pr);
		const unresolvedStr = unresolved > 0 ? `${unresolved}` : "-";

		console.log(
			`| [#${pr.number}](${pr.url}) | ${title} | @${pr.author.login} | ${state} | ${formatStatus(pr)} | ${formatReviewDecision(pr.reviewDecision)} | ${unresolvedStr} |`,
		);
	}

	// Detailed unresolved comments section
	const prsWithUnresolved = prs.filter(
		(pr) => countUnresolvedThreads(pr) > 0,
	);
	if (prsWithUnresolved.length > 0) {
		console.log("\n### Unresolved Review Comments\n");
		for (const pr of prsWithUnresolved) {
			const threads = pr.reviewThreads.nodes.filter((t) => !t.isResolved);
			console.log(`**#${pr.number}** - ${threads.length} unresolved:`);
			for (const thread of threads.slice(0, 5)) {
				const comment = thread.comments.nodes[0];
				if (comment) {
					const preview =
						comment.body.length > 80
							? `${comment.body.slice(0, 77)}...`
							: comment.body;
					console.log(`  - @${comment.author.login}: ${preview}`);
				}
			}
			if (threads.length > 5) {
				console.log(`  - ... and ${threads.length - 5} more`);
			}
			console.log();
		}
	}
}

async function main() {
	const { repo: specifiedRepo } = parseArgs();

	try {
		const repo = await getRepo(specifiedRepo);
		const prs = await fetchPRs(repo);
		formatOutput(repo, prs);
	} catch (error) {
		console.error("Error fetching PR status:", error);
		process.exit(1);
	}
}

main();
