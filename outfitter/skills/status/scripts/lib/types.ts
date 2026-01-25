/**
 * Shared types for status gatherers
 */

/** Possible states for a gatherer operation. */
export type GathererStatus = "success" | "unavailable" | "error";

/**
 * Result returned by a status gatherer.
 * @typeParam T - Type of gathered data
 */
export interface GathererResult<T = unknown> {
	/** Source identifier */
	source: string;
	/** Operation status */
	status: GathererStatus;
	/** Gathered data (present when success) */
	data?: T;
	/** Error message (present when error) */
	error?: string;
	/** Unavailability reason (present when unavailable) */
	reason?: string;
	/** ISO timestamp of when data was gathered */
	timestamp: string;
}

/**
 * Issue from Beads local issue tracking.
 */
export interface BeadsIssue {
	id: string;
	title: string;
	description?: string;
	status: "open" | "in_progress" | "blocked" | "closed";
	issue_type: "bug" | "feature" | "task" | "epic" | "chore";
	priority: 0 | 1 | 2 | 3 | 4;
	assignee?: string;
	labels: string[];
	created_at: string;
	updated_at: string;
	closed_at?: string;
	dependency_count: number;
	dependent_count: number;
}

/**
 * Aggregated statistics for Beads issues.
 */
export interface BeadsStats {
	total: number;
	open: number;
	in_progress: number;
	blocked: number;
	closed: number;
	ready: number;
	average_lead_time?: number;
}

/**
 * Data gathered from Beads issue tracker.
 */
export interface BeadsData {
	stats: BeadsStats;
	inProgress: BeadsIssue[];
	ready: BeadsIssue[];
	blocked: BeadsIssue[];
	recentlyClosed: BeadsIssue[];
}

/**
 * Pull request from GitHub.
 */
export interface GitHubPR {
	number: number;
	title: string;
	state: "OPEN" | "CLOSED" | "MERGED";
	isDraft: boolean;
	author: { login: string };
	updatedAt: string;
	url: string;
	headRefName: string;
	statusCheckRollup?: {
		state: "SUCCESS" | "FAILURE" | "PENDING" | "EXPECTED";
		contexts?: Array<{
			name: string;
			state: string;
			conclusion?: string;
		}>;
	};
	reviewDecision?: "APPROVED" | "CHANGES_REQUESTED" | "REVIEW_REQUIRED" | null;
}

/**
 * GitHub Actions workflow run.
 */
export interface GitHubWorkflowRun {
	name: string;
	status: string;
	conclusion: string | null;
	createdAt: string;
	url: string;
}

/**
 * Data gathered from GitHub.
 */
export interface GitHubData {
	repo: string;
	openPRs: GitHubPR[];
	recentRuns: GitHubWorkflowRun[];
}

/**
 * Branch in a Graphite stack.
 */
export interface GraphiteBranch {
	name: string;
	prNumber?: number;
	prStatus?: "draft" | "open" | "ready" | "merged" | "closed";
	prUrl?: string;
	parent?: string;
	children: string[];
	isCurrent: boolean;
	needsRestack: boolean;
	needsSubmit: boolean;
	commitCount: number;
}

/**
 * Data gathered from Graphite.
 */
export interface GraphiteData {
	currentBranch: string;
	trunk: string;
	branches: GraphiteBranch[];
	stacks: string[][]; // Each stack as array of branch names
}

/**
 * Issue from Linear.
 */
export interface LinearIssue {
	identifier: string;
	title: string;
	state: {
		name: string;
		type: string;
	};
	priority: number;
	assignee?: { name: string };
	labels: Array<{ name: string }>;
	createdAt: string;
	updatedAt: string;
	url: string;
}

/**
 * Data gathered from Linear.
 */
export interface LinearData {
	team?: string;
	issues: LinearIssue[];
}

/**
 * Aggregated status report result.
 */
export interface SitrepResult {
	timeConstraint: string;
	timestamp: string;
	sources: string[];
	results: {
		graphite?: GathererResult<GraphiteData>;
		github?: GathererResult<GitHubData>;
		linear?: GathererResult<LinearData>;
		beads?: GathererResult<BeadsData>;
	};
}
