import type { Metadata } from "next";
import StornoClient from "@/components/StornoClient";

export const metadata: Metadata = {
  title: "Termin stornieren",
  robots: { index: false, follow: false },
};

export default async function StornoPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return <StornoClient token={typeof token === "string" ? token : ""} />;
}
