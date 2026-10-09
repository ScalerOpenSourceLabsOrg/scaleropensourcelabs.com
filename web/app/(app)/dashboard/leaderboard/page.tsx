import type { Metadata } from "next";
import Leaderboard from "@/components/dashboard/Leaderboard";

// THE CLUB'S RANKING. Like every other route under (app), this markup is part of the
// static export and ships to anybody who asks for it — what refuses a stranger is
// firestore.rules, where `leaderboard/current` is readable only by an admitted member.
//
// `noindex`, because it names members. The rules already stop a crawler reading the data,
// but "Leaderboard" on a club site is exactly the URL somebody links to from outside, and
// the people on it agreed to be in a club rather than in a public ranking.

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "Merged pull requests across the club.",
  robots: { index: false, follow: false },
};

export default function LeaderboardPage() {
  return <Leaderboard />;
}
