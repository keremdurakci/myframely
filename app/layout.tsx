import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyFramely | Custom License Plate Frames",
  description:
    "Shop handmade custom license plate frames with premium epoxy finish. Cute, unique, veteran, pink, Snoopy, Hello Kitty inspired and decorative car plate frames for North American plates.",
  keywords: [
    "custom license plate frames",
    "handmade license plate frame",
    "epoxy license plate frame",
    "cute car accessories",
    "decorative license plate holder",
    "Snoopy license plate frame",
    "Hello Kitty license plate frame",
    "veteran license plate frame",
    "pink license plate frame",
    "North American license plate frame",
  ],
  openGraph: {
    title: "MyFramely | Custom License Plate Frames",
    description:
      "Premium handmade license plate frames. Unique and decorative car accessories.",
    url: "https://myframely.com",
    siteName: "MyFramely",
    images: [
      {
        url: "/myframely-logo.png",
        width: 1200,
        height: 630,
        alt: "MyFramely License Plate Frames",
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