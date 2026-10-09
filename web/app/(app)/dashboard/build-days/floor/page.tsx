import type { Metadata } from "next";
import SectionHead from "@/components/dashboard/SectionHead";
import FloorDesk from "@/components/floor/FloorDesk";

// The mentors' live view of a Build Day. Under /dashboard rather than /admin because floor
// mentors are not organisers. NOT a privilege gate — see components/floor/FloorDesk.tsx.
export const metadata: Metadata = {
  title: "Help queue",
  description: "Who wants a hand at today's Build Day.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <>
      <SectionHead eyebrow="Build Day" title="Help queue.">
        Hands up first, then the quiet ones.
      </SectionHead>
      <FloorDesk />
    </>
  );
}
