import type { Metadata } from "next";
import AdminGate from "@/components/admin/Gate";
import SectionHead from "@/components/dashboard/SectionHead";
import Cohort from "@/components/admin/Cohort";

// One organiser concern, one route. Taking the roll is weekly; this is once a term and
// across every Build Day at once, which is why it is not a tab on that screen.
// NOT a privilege gate; see components/admin/Gate.tsx.
export const metadata: Metadata = {
  title: "Cohort",
  description: "Every student's Build Days side by side, for choosing the mentor cohort.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <AdminGate>
      <SectionHead eyebrow="Organisers" title="Cohort.">
        Who keeps showing up and what they&rsquo;ve landed, side by side — for picking the
        mentor cohort.
      </SectionHead>
      <Cohort />
    </AdminGate>
  );
}
