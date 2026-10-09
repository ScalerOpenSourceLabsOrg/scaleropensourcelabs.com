"use client";

// A pull request you are allowed to open, and then merge.
//
// The single best moment in open source is pressing the green button on your own
// pull request — or watching a maintainer press it. Nobody arriving on this page has
// felt it yet, so this lets them fake it from both sides, switched with a tab:
//
//   - Contributor view: GitHub's "Open a pull request" compare page. Edit the title,
//     press "Create pull request", and the PR exists.
//   - Maintainer view: the merge box, with the two-step "Merge pull request" →
//     "Confirm merge" GitHub uses, a badge that flips from Open to Merged, confetti.
//
// Either one, finished, ends on the same invitation to make it real.
//
// The count of fake merges is kept per browser, purely for the joke in the footer of
// the card. It is a convenience: storage can be missing and the card still works.

import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import { celebrate } from "@/components/fx/celebrate";
import { unlock } from "@/components/fx/achievements";
import { JOIN_HREF } from "@/content/site";

type View = "contributor" | "maintainer";
type Stage = "open" | "confirm" | "merging" | "merged";
type Draft = "draft" | "creating" | "created";

const KEY = "osc-fake-merges";
const CHECKS = ["build / next build", "lint / eslint", "test / playwright"];
const TITLE = "Fix the typo in the README that has bugged everyone since 2019";
const VIEWS: { id: View; label: string; icon: "git-pull-request" | "git-merge" }[] = [
  { id: "contributor", label: "Contributor view", icon: "git-pull-request" },
  { id: "maintainer", label: "Maintainer view", icon: "git-merge" },
];

function readCount(): number {
  try {
    return Number(localStorage.getItem(KEY)) || 0;
  } catch {
    return 0;
  }
}

export default function MergePlayground() {
  const [view, setView] = useState<View>("contributor");
  const [draft, setDraft] = useState<Draft>("draft");
  const [title, setTitle] = useState(TITLE);
  const [stage, setStage] = useState<Stage>("open");
  const [count, setCount] = useState(0);

  useEffect(() => setCount(readCount()), []);

  const create = () => {
    setDraft("creating");
    window.setTimeout(() => {
      setDraft("created");
      void celebrate();
    }, 700);
  };

  const confirm = () => {
    setStage("merging");
    window.setTimeout(() => {
      setStage("merged");
      const next = readCount() + 1;
      setCount(next);
      try {
        localStorage.setItem(KEY, String(next));
      } catch {
        // No storage — the merge still happened, as far as this card is concerned.
      }
      void celebrate();
      // Achievements (see fx/achievements.ts). Quickdraw is a merge inside 15s
      // of the page loading, which is a joke about not reading the diff.
      unlock("pull-shark");
      if (performance.now() < 15000) unlock("quickdraw");
    }, 700);
  };

  const merged = stage === "merged";
  const created = draft === "created";
  const prTitle = title.trim() || TITLE;

  // Both views end here.
  const yours = (
    <Link href={JOIN_HREF} className="btn btn-pop btn-compact">
      Make this your view! →
    </Link>
  );

  return (
    <div className="mx-auto max-w-3xl">
      <div role="tablist" aria-label="Which side of the pull request" className="pr-tabs">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            role="tab"
            aria-selected={view === v.id}
            onClick={() => setView(v.id)}
            className="pr-tab"
          >
            <Icon name={v.icon} size="1em" strokeWidth={2.5} />
            {v.label}
          </button>
        ))}
      </div>

      <div className="pr-card" role="tabpanel">
        {/* Header. Before the PR exists, GitHub shows the compare bar instead. */}
        <div className="border-b border-seam px-5 py-4 sm:px-6">
          <p className="font-sans text-lg font-semibold leading-snug text-ink sm:text-xl">
            {view === "contributor" && !created ? (
              "Open a pull request"
            ) : (
              <>
                {prTitle} <span className="font-normal text-dust">#1</span>
              </>
            )}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-haze">
            {view === "contributor" && !created ? (
              <>
                <span>
                  base: <code className="pr-ref">main</code> ← compare:{" "}
                  <code className="pr-ref">fix/typo</code>
                </span>
                <span className="text-[rgb(var(--added))]">✓ Able to merge.</span>
              </>
            ) : (
              <>
                <span className={`pr-state ${merged ? "pr-state-merged" : "pr-state-open"}`}>
                  <Icon name={merged ? "git-merge" : "git-pull-request"} size="1em" strokeWidth={2.5} />
                  {merged ? "Merged" : "Open"}
                </span>
                <span>
                  <strong className="font-semibold text-ink">you</strong>{" "}
                  {merged ? "merged" : "want to merge"} 1 commit into{" "}
                  <code className="pr-ref">main</code> from <code className="pr-ref">fix/typo</code>
                </span>
              </>
            )}
          </div>
        </div>

        {/* The diff, all one line of it. */}
        <div className="border-b border-seam font-mono text-[0.8125rem] leading-6">
          <div className="flex items-center justify-between bg-sunk px-5 py-1.5 text-dust sm:px-6">
            <span>README.md</span>
            <span>
              <span className="text-[rgb(var(--added))]">+1</span>{" "}
              <span className="text-flag">−1</span>
            </span>
          </div>
          <p className="diff-del px-5 sm:px-6">- Contributions are welcome! Please read the the guide.</p>
          <p className="diff-add px-5 sm:px-6">+ Contributions are welcome! Please read the guide.</p>
        </div>

        <div className="px-5 py-4 sm:px-6">
          {view === "contributor" ? (
            <div className="rounded-tile border border-seam p-4" aria-live="polite">
              {created ? (
                <div>
                  <p className="flex items-center gap-2 font-semibold text-ink">
                    <span className="pr-state pr-state-open !px-2 !py-1">
                      <Icon name="git-pull-request" size="1em" strokeWidth={2.5} />
                    </span>
                    Pull request opened
                  </p>
                  <p className="mt-3 text-body text-haze">
                    Your first PR is out there. Now somebody gets to review it.
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {yours}
                    <button
                      type="button"
                      onClick={() => setView("maintainer")}
                      className="tap font-mono text-xs text-dust hover:text-ink"
                    >
                      → now merge it as the maintainer
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block">
                    <span className="text-sm font-semibold text-ink">Add a title</span>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      disabled={draft === "creating"}
                      className="pr-input mt-1.5"
                    />
                  </label>
                  <label className="mt-3 block">
                    <span className="text-sm font-semibold text-ink">Add a description</span>
                    <textarea
                      rows={2}
                      defaultValue="One extra “the”. Gone."
                      disabled={draft === "creating"}
                      className="pr-input mt-1.5 resize-none"
                    />
                  </label>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={create}
                      disabled={draft === "creating"}
                      className="btn btn-merge btn-compact"
                    >
                      {draft === "creating" ? "Creating…" : "Create pull request"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <ul className="space-y-1.5 text-sm">
                {CHECKS.map((c) => (
                  <li key={c} className="flex items-center gap-2 text-haze">
                    <span aria-hidden className="text-[rgb(var(--added))]">✓</span>
                    <span className="font-mono text-[0.8125rem]">{c}</span>
                    <span className="text-dust">— Successful</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 rounded-tile border border-seam p-4" aria-live="polite">
                {merged ? (
                  <div>
                    <p className="flex items-center gap-2 font-semibold text-ink">
                      <span className="pr-state pr-state-merged !px-2 !py-1">
                        <Icon name="git-merge" size="1em" strokeWidth={2.5} />
                      </span>
                      Pull request successfully merged and closed
                    </p>
                    <p className="mt-3 text-body text-haze">
                      That&apos;s the feeling. Next time, a maintainer you&apos;ve never met
                      presses it for you.
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      {yours}
                      <button
                        type="button"
                        onClick={() => setStage("open")}
                        className="tap font-mono text-xs text-dust hover:text-ink"
                      >
                        ↺ un-merge it (you can&apos;t, usually)
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold text-ink">This branch has no conflicts with the base branch</p>
                    <p className="mt-1 text-sm text-haze">Merging can be performed automatically.</p>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      {stage === "open" ? (
                        <button type="button" onClick={() => setStage("confirm")} className="btn btn-merge btn-compact">
                          Merge pull request
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={confirm}
                            disabled={stage === "merging"}
                            className="btn btn-merge btn-compact"
                          >
                            {stage === "merging" ? "Merging…" : "Confirm merge"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setStage("open")}
                            disabled={stage === "merging"}
                            className="btn btn-secondary btn-compact"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {count > 0 && (
                <p className="mt-3 font-mono text-xs text-dust">
                  You have merged {count} pull request{count === 1 ? "" : "s"} on this page.
                  Upstream: 0. Yet.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
