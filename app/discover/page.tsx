import type { Metadata } from "next";
import DiscoverPageClient from "./DiscoverPageClient";

export const metadata: Metadata = {
  title: "Discover Grants — Beacon",
};

export default function DiscoverPage() {
  return <DiscoverPageClient />;
}
