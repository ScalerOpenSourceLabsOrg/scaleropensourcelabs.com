import type { Metadata } from "next";
import AdminGate from "@/components/admin/Gate";
import SectionHead from "@/components/dashboard/SectionHead";
import Sessions from "@/components/Sessions";

// One organiser concern, one route. /admin was six of these on one page — an organiser
// opening it to post a notice scrolled past the membership table and a form builder.
// NOT a privilege gate; see components/admin/Gate.tsx.
export const metadata: Metadata = {
  title: "Sessions",
  description: "When the club meets, and what's on.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <AdminGate>
      <SectionHead eyebrow="Organisers" title="Sessions.">
        When the club meets, and what&apos;s on.
      </SectionHead>
      <Sessions />
    </AdminGate>
  );
}
