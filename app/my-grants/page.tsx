import type { Metadata } from "next";
import MyGrantsPageClient from "./MyGrantsPageClient";

export const metadata: Metadata = {
  title: "My Grants — Beacon",
};

export default function MyGrantsPage() {
  return <MyGrantsPageClient />;
}
