import type { Metadata } from "next";
import { Bricolage_Grotesque, JetBrains_Mono, DM_Sans } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import CustomCursor from "@/components/CustomCursor";
import ThemeProvider from "@/components/ThemeProvider";
import ClientLayout from "@/components/ClientLayout";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aswin Venu M — Jr. Software Engineer",
  description:
    "Full-stack engineer from Trivandrum, India. Building scalable web applications — school management systems, booking platforms, and more.",
  keywords: ["Aswin Venu M", "Software Engineer", "Full Stack", "React", "Next.js", "Node.js", "Trivandrum"],
  authors: [{ name: "Aswin Venu M" }],
  openGraph: {
    title: "Aswin Venu M — Jr. Software Engineer",
    description: "Building full-stack systems that actually work.",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${jetbrains.variable} ${dmSans.variable}`}
    >
      <body>
        <ThemeProvider>
          <ClientLayout>
            <SmoothScroll>
              <CustomCursor />
              {children}
            </SmoothScroll>
          </ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
