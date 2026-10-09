"use client";

// Who may work the help queue at Build Days. A floor mentor sees the live floor and can
// claim a raised hand; they get nothing else an organiser has. See isFloorMentor() in
// firestore.rules.
//
// COLLEGE ADDRESSES ONLY. Sign-in refuses every other domain, so a mentor with a personal
// Gmail could be added here and never get in — the form says so up front instead.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { ALLOWED_EMAIL_DOMAIN } from "@/lib/firebase";
import {
  readFloorMentors,
  removeFloorMentor,
  saveFloorMentor,
  type FloorMentor,
} from "@/lib/floor";
import { ctl } from "@/components/admin/ui";

export default function FloorMentors() {
  const { user, isAdmin } = useAuth();
  const [rows, setRows] = useState<FloorMentor[] | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      setRows(await readFloorMentors());
    } catch (e) {
      console.error("[osc] could not read floor mentors", e);
      setRows([]);
      setError("Couldn't load floor mentors.");
    }
  }

  useEffect(() => {
    if (isAdmin === true) void load();
  }, [isAdmin]);

  if (isAdmin !== true || !user?.email) return null;
  const actor = user.email;

  async function run(key: string, fn: () => Promise<void>) {
    setBusy(key);
    setError("");
    try {
      await fn();
      await load();
    } catch (e) {
      console.error("[osc] floor mentor write failed", e);
      setError("That didn't save.");
    } finally {
      setBusy("");
    }
  }

  function add() {
    const e = email.trim().toLowerCase();
    if (!e.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)) {
      setError(`Use their @${ALLOWED_EMAIL_DOMAIN} address.`);
      return;
    }
    if (!name.trim()) {
      setError("Add a name.");
      return;
    }
    const existing = rows?.find((r) => r.email === e) ?? null;
    void run(e, async () => {
      await saveFloorMentor(actor, { email: e, name, active: true }, existing);
      setEmail("");
      setName("");
    });
  }

  return (
    <div className="card rounded-panel bg-raise p-6 sm:p-7">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="label">Floor mentors</h3>
        <Link
          href="/dashboard/build-days/floor"
          className="tap font-mono text-label uppercase tracking-wider text-haze underline hover:text-ink"
        >
          Open the help queue →
        </Link>
      </div>
      <p className="mt-2 text-sm text-haze">They can claim hands at Build Days. Nothing else.</p>

      <div className="mt-4 flex flex-wrap gap-3">
        <input
          className={`${ctl} min-w-0 flex-1`}
          placeholder={`name@${ALLOWED_EMAIL_DOMAIN}`}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="College email"
        />
        <input
          className={`${ctl} min-w-0 flex-1`}
          placeholder="Name students will see"
          maxLength={120}
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="Name"
        />
        <button
          type="button"
          className="btn btn-primary btn-compact disabled:opacity-60"
          disabled={busy !== ""}
          onClick={add}
        >
          Add
        </button>
      </div>

      {error && (
        <p className="mt-3 text-sm text-ember" role="alert">
          {error}
        </p>
      )}

      <ul className="mt-4 divide-y divide-seam border-t border-seam">
        {rows === null && <li className="py-3 text-sm text-haze">Loading…</li>}
        {rows?.length === 0 && <li className="py-3 text-sm text-dust">None yet.</li>}
        {rows?.map((m) => (
          <li key={m.email} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
            <span className="min-w-0 flex-1">
              <span className={`block text-sm font-medium ${m.active ? "text-ink" : "text-dust"}`}>
                {m.name}
                {!m.active && <span className="ml-2 font-mono text-label uppercase">off</span>}
              </span>
              <span className="block truncate font-mono text-xs text-dust">{m.email}</span>
            </span>
            <button
              type="button"
              className="tap font-mono text-label uppercase tracking-wider text-haze underline hover:text-ink"
              disabled={busy !== ""}
              onClick={() =>
                void run(m.email, () =>
                  saveFloorMentor(actor, { email: m.email, name: m.name, active: !m.active }, m),
                )
              }
            >
              {m.active ? "Switch off" : "Switch on"}
            </button>
            <button
              type="button"
              className="tap font-mono text-label uppercase tracking-wider text-ember underline"
              disabled={busy !== ""}
              onClick={() => void run(m.email, () => removeFloorMentor(m.email))}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
