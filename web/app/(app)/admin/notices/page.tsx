import type { Metadata } from "next";
import AdminGate from "@/components/admin/Gate";
import SectionHead from "@/components/dashboard/SectionHead";
import Composer from "@/components/Composer";

// One organiser concern, one route. /admin was six of these on one page — an organiser
// opening it to post a notice scrolled past the membership table and a form builder.
// NOT a privilege gate; see components/admin/Gate.tsx.
export const metadata: Metadata = {
  title: "Notices",
  description: "Post to the board on every member's dashboard.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <AdminGate>
      <SectionHead eyebrow="Organisers" title="Notices.">
        Post it here and it tops every member&apos;s dashboard.
      </SectionHead>
      <Composer />
    </AdminGate>
  );
}
