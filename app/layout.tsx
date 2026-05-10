import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tingis Print - طباعة احترافية في المغرب",
  description:
    "Tingis Print - شريكك المثالي في الطباعة والإعلان بالمغرب. طباعة على الملابس والحقائب والتغليف والهوية البصرية بجودة عالية. عملنا مع مئات المشاريع.",
  keywords:
    "طباعة, مغرب, Tingis Print, طباعة ملابس, تغليف, علامة تجارية, إعلان, دروبشيبينغ, طباعة احترافية",
  openGraph: {
    title: "Tingis Print - طباعة احترافية في المغرب",
    description: "شريكك المثالي في الطباعة والإعلان بالمغرب",
    type: "website",
    locale: "ar_MA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tingis Print - طباعة احترافية بالمغرب",
    description: "شريكك المثالي فالطباعة والإشهار بالمغرب",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="font-cairo antialiased">{children}</body>
    </html>
  );
}
