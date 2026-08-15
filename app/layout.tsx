import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyFramely | Personalized Plate Finder & Custom License Plate Frames",
  description:
    "Find a personalized license plate that's actually available — generate plate ideas and check availability in supported U.S. states. Plus shop handmade custom license plate frames with premium epoxy finish.",
  keywords: [
    "personalized license plate finder",
    "vanity plate availability checker",
    "license plate name generator",
    "custom license plate frames",
    "handmade license plate frame",
    "epoxy license plate frame",
    "cute car accessories",
    "decorative license plate holder",
    "veteran license plate frame",
    "North American license plate frame",
  ],
  openGraph: {
    title: "MyFramely | Personalized Plate Finder & Custom License Plate Frames",
    description:
      "Generate personalized license plate ideas, check availability in supported U.S. states, and shop premium handmade license plate frames.",
    url: "https://myframely.com",
    siteName: "MyFramely",
    images: [
      {
        url: "/myframely-logo.png",
        width: 1200,
        height: 630,
        alt: "MyFramely",
      },
    ],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}