"use client";

// The mentorship section, on its own route.
//
// IT WAS THE LAST THING ON THE OVERVIEW, below four panels and a two-column grid, and that
// was the wrong place for it twice over. It is the club's headline activity — the reason
// most people join — and it is a decision made once a term rather than something read
// weekly, so it was both buried and mixed in with things that change every week.
//
// On its own route it gets the whole column, which the picker genuinely needs: choosing a
// mentor means reading several descriptions side by side, and that is a page, not a panel.
//
// ORGANISERS SEE THE RESULTS HERE, not the picker. They open the same sidebar link as
// everybody else, and what they want from it is what everybody else chose. The picker is
// one click away for an organiser who is also enrolling.

import { useState } from "react";
import RequireProfile from "@/components/dashboard/RequireProfile";
import SectionHead from "@/components/dashboard/SectionHead";
import MentorshipResults from "@/components/dashboard/MentorshipResults";
import MentorPicker from "@/components/MentorPicker";
import { useAuth } from "@/lib/auth";

export default function MentorshipSection() {
  const { isAdmin } = useAuth();
  const [mine, setMine] = useState(false);
  const results = isAdmin === true && !mine;

  return (
    <RequireProfile loading="Loading…">
      {({ user }) => (
        <>
          <SectionHead
            eyebrow="Programmes"
            title="Mentorship."
            action={
              isAdmin === true ? (
                <button
                  type="button"
                  onClick={() => setMine((v) => !v)}
                  className="btn btn-secondary btn-compact"
                >
                  {mine ? "See results" : "My preferences"}
                </button>
              ) : undefined
            }
          >
            {results
              ? "Who members picked, mentor by mentor."
              : "Pick your preferences — organisers pair everyone once enrolment closes."}
          </SectionHead>
          {results ? <MentorshipResults /> : <MentorPicker user={user} />}
        </>
      )}
    </RequireProfile>
  );
}
