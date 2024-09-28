import { For, Show, Suspense, createSignal } from "solid-js";
import { getCommits, getOrginizations, getRepos, getUser } from "~/github";

export default function Home() {
  const user = getUser();
  const [selectedOwner, setSelectedOwner] = createSignal("");
  const [selectedRepo, setSelectedRepo] = createSignal("");
  const [selectedDate, setSelectedDate] = createSignal("");

  const isOrgSelected = () =>
    !!selectedOwner() && user.data?.login !== selectedOwner();

  const repos = getOrginizations();
  const orgRepos = getRepos(selectedOwner, isOrgSelected);
  const commits = getCommits(selectedOwner, selectedRepo, selectedDate);

  const debouce = (fn: Function, delay: number) => {
    let timer: any;
    return function (...args: any) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        fn(...args);
      }, delay);
    };
  };

  const setDate = debouce((value: string) => {
    setSelectedDate(value);
  }, 300);

  return (
    <main class="text-center mx-auto text-gray-700 p-4">
      <div class="w-full max-w-3xl mx-auto p-6 space-y-6">
        <div class="space-y-2">
          <h2 class="text-2xl font-bold">Mina</h2>
          <p class="text-gray-500">
            Simple app to display commits on a specific date in a specific
            repository.
          </p>
        </div>
        <div class="bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
          <div class="space-y-2">
            <h3 class="text-lg font-bold text-neutral-300">Select Owner</h3>
            <p class="text-gray-500">
              Choose whether you want to select a GitHub user or organization.
            </p>
            <select
              class="block w-full bg-gray-700 dark:bg-gray-600 border-gray-600 dark:border-gray-500 rounded-lg py-2 px-3 text-gray-400 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onChange={(e) => {
                if (e.target.value === "") {
                  return;
                }
                setSelectedOwner(e.target.value);
              }}
            >
              <option value="">Select an Owner</option>
              <option value={user.data?.login}>{user.data?.login}</option>
              <For each={repos.data}>
                {(org) => <option value={org.login}>{org.login}</option>}
              </For>
            </select>
          </div>
          <div class="space-y-2">
            <Show when={isOrgSelected()}>
              <h3 class="text-lg font-bold">Select Repository</h3>
              <p class="text-gray-500">
                Choose the repository you would like to work with.
              </p>
              <div class="space-y-2">
                <label class="block text-gray-700 font-medium">
                  Repository
                </label>
                <Suspense fallback={<p>Loading Repos...</p>}>
                  <select
                    class="block w-full bg-gray-700 dark:bg-gray-600 border-gray-600 dark:border-gray-500 rounded-lg py-2 px-3 text-gray-400 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onChange={(e) => setSelectedRepo(e.target.value)}
                  >
                    <option value="">Select a Repo</option>
                    <For each={orgRepos.data}>
                      {(repo) => <option value={repo.name}>{repo.name}</option>}
                    </For>
                  </select>
                </Suspense>
              </div>
            </Show>
          </div>
          <div class="space-y-2">
            <Show when={selectedRepo()}>
              <h3 class="text-lg font-bold">Select Date</h3>
              <p class="text-gray-500">
                Choose the date you would like to view data for.
              </p>
              <div class="space-y-2">
                <label class="block text-gray-700 font-medium">Date</label>
                <input
                  class="block w-full bg-gray-700 dark:bg-gray-600 border-gray-600 dark:border-gray-500 rounded-lg py-2 px-3 text-gray-400 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  type={"date"}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </Show>
          </div>
        </div>
        <Suspense fallback={<p>Loading Commits...</p>}>
          <Show when={isOrgSelected()}>
            <div class={"grid grid-cols-3 gap-2"}>
              <For each={commits.data}>
                {(commit) => (
                  <a href={commit.html_url} target="_blank">
                    <div
                      class={
                        "bg-gray-800 text-gray-300 rounded p-6 flex flex-col"
                      }
                    >
                      <p>{commit.commit.message}</p>
                      <div class={"w-full items-end justify-end"}>
                        <p>{commit.commit.author.date}</p>
                      </div>
                    </div>
                  </a>
                )}
              </For>
            </div>
          </Show>
        </Suspense>
      </div>
    </main>
  );
}
