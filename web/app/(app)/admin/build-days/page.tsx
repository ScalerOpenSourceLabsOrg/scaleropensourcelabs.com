import type { Metadata } from "next";
import AdminGate from "@/components/admin/Gate";
import SectionHead from "@/components/dashboard/SectionHead";
import BuildDays from "@/components/admin/BuildDays";
import FloorMentors from "@/components/admin/FloorMentors";

// One organiser concern, one route. The roll call is the screen an organiser has open
// DURING a session rather than between them, which is the argument for it not being a
// panel on /admin/sessions: scheduling is done in advance and calmly, and marking forty
// people is done in a room with the clock running.
// NOT a privilege gate; see components/admin/Gate.tsx.
export const metadata: Metadata = {
  title: "Build Days",
  description: "Who came, their track, and what they worked on.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <AdminGate>
      <SectionHead eyebrow="Organisers" title="Build Days.">
        Who came, their track, and what they worked on. PRs live on each member&rsquo;s
        dashboard, straight from GitHub.
      </SectionHead>
      <BuildDays />
      <div className="mt-6">
        <FloorMentors />
      </div>
    </AdminGate>
  );
}
