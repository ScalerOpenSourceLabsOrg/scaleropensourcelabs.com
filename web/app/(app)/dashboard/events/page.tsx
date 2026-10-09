import type { Metadata } from "next";
import EventsSection from "@/components/dashboard/EventsSection";

// THE MEMBER'S DIARY. Distinct from /events, which is the public, hand-kept page aimed at
// somebody deciding whether to join — this is the live `sessions` collection, including
// the sessions an organiser marked members-only, which is why it can only live in here.
//
// `noindex`, like every signed-in route: the markup ships with the static export, and the
// rules are what refuse a stranger the data behind it.

export const metadata: Metadata = {
  title: "What's on",
  description: "Sessions and Build Days the club has scheduled.",
  robots: { index: false, follow: false },
};

export default function EventsPage() {
  return <EventsSection />;
}
