import type { Metadata } from "next";
import Script from "next/script";
import JsonLd from "@/components/JsonLd";
import Footer from "@/components/Footer";
import "./globals.css";

const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "MyFramely",
  url: "https://www.myframely.com",
  logo: "https://www.myframely.com/myframely-logo.png",
};

const GA_MEASUREMENT_ID = "G-SVE8WDQ34E";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.myframely.com"),
  alternates: { canonical: "/" },
  title: "MyFramely | Custom License Plate Frames",
  description:
    "Shop handmade custom license plate frames with a premium hand-poured epoxy finish, for North American plates.",
  keywords: [
    "custom license plate frames",
    "handmade license plate frame",
    "epoxy license plate frame",
    "cute car accessories",
    "decorative license plate holder",
    "veteran license plate frame",
    "North American license plate frame",
  ],
  openGraph: {
    title: "MyFramely | Custom License Plate Frames",
    description:
      "Shop premium handmade epoxy license plate frames for North American plates.",
    url: "https://www.myframely.com",
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
      <body>
        <JsonLd data={ORGANIZATION_JSON_LD} />
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        {children}
        <Footer />
      </body>
    </html>
  );
}