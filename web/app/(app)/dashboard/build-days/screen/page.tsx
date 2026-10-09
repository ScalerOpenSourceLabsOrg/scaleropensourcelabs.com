import type { Metadata } from "next";
import BigScreen from "@/components/floor/BigScreen";

// The projector view of a live Build Day. NOT a privilege gate — see
// components/floor/BigScreen.tsx.
export const metadata: Metadata = {
  title: "Big screen",
  description: "Today's Build Day, live.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <BigScreen />;
}
