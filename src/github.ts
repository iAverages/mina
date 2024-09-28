import { createQuery } from "@tanstack/solid-query";
import { Accessor } from "solid-js";

const getAccessToken = () => {
    return (
        document.cookie
            .split(";")
            .find((cookie) => cookie.trim().startsWith("github_token="))
            ?.split("=")[1] ?? null
    );
};
const callApi = async <T>(path: string) => {
    const res = await fetch(`https://api.github.com/${path}`, {
        headers: {
            Authorization: `Bearer ${getAccessToken()}`,
        },
    });
    return res.json() as Promise<T>;
};

export type GithubUser = {
    login: string;
};

export const getUser = () => {
    return createQuery(() => ({
        enabled: !!getAccessToken(),
        queryKey: ["user"],
        queryFn: async () => {
            return callApi<GithubUser>("user");
        },
    }));
};

export interface GithubOrg {
    login: string;
    id: number;
    node_id: string;
    url: string;
    repos_url: string;
    events_url: string;
    hooks_url: string;
    issues_url: string;
    members_url: string;
    public_members_url: string;
    avatar_url: string;
    description: string;
}

export const getOrginizations = () => {
    return createQuery(() => ({
        enabled: !!getAccessToken(),
        queryKey: ["orgs"],
        queryFn: async () => {
            return callApi<GithubOrg[]>("user/orgs");
        },
    }));
};

export interface GithubRepo {
    id: number;
    node_id: string;
    name: string;
    full_name: string;
    private: boolean;
    html_url: string;
    description: string;
    default_branch: string;
    pushed_at: string;
    created_at: string;
}

export const getRepos = (owner: Accessor<string>, org: Accessor<boolean>) => {
    return createQuery(() => ({
        enabled: !!getAccessToken() && !!owner(),
        queryKey: ["repos", owner()],
        queryFn: async () => {
            if (org()) {
                console.log("orgs");
                return callApi<GithubRepo[]>(`orgs/${owner()}/repos`);
            }
            return callApi<GithubRepo[]>(`users/${owner()}/repos`);
        },
    }));
};

export const getOrginizationRepos = (org: Accessor<string>) => {
    return createQuery(() => ({
        enabled: !!getAccessToken() && !!org(),
        queryKey: ["org", org(), "repos"],
        queryFn: async () => {
            return callApi<GithubRepo[]>(`orgs/${org()}/repos`);
        },
    }));
};

export const getUserRepos = () => {
    return createQuery(() => ({
        enabled: !!getAccessToken(),
        queryKey: ["user", "repos"],
        queryFn: async () => {
            return callApi<GithubRepo[]>(`users/repos`);
        },
    }));
};

export type SingleDate = string;
export type DateRange = { startDate: string; endDate: string };
export type SearchDates = SingleDate | DateRange;

export interface GithubCommit {
    sha: string;
    html_url: string;
    commit: Commit;
    author: Author;
    committer: Committer;
}

export interface Commit {
    author: Author;
    committer: Committer;
    message: string;
}

export interface Author {
    name: string;
    email: string;
    date: string;
}

export interface Committer {
    name: string;
    email: string;
    date: string;
}

export interface Author2 {
    login: string;
    avatar_url: string;
    html_url: string;
}

export interface Committer2 {
    login: string;
    id: number;
    avatar_url: string;
    html_url: string;
}

export const getCommits = (owner: Accessor<string>, repo: Accessor<string>, dates: Accessor<SearchDates>) => {
    return createQuery(() => ({
        enabled: !!getAccessToken() && !!owner() && !!repo() && !!dates(),
        queryKey: ["commits", owner(), repo(), dates()],
        queryFn: async () => {
            if (typeof dates() === "string") {
                const date = new Date(dates() as string);

                const base = `${date.getFullYear()}-${date.getMonth() + 1}-`;
                // -1 on the date to include commits from today
                const since = `${base}${date.getDate() - 1}`;
                const until = `${base}${date.getDate()}`;

                const today = new Date();
                const formattedToday = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

                // if the date is today, only get commits since the start of the day
                if (until === formattedToday) {
                    return callApi<GithubCommit[]>(`repos/${owner()}/${repo()}/commits?since=${since}`);
                }

                return callApi<GithubCommit[]>(`repos/${owner()}/${repo()}/commits?since=${since}&until=${until}`);
            }

            const d = dates() as DateRange;
            return callApi<GithubCommit[]>(
                `repos/${owner()}/${repo()}/commits?since=${d.startDate}&until=${d.endDate}`,
            );
        },
    }));
};
