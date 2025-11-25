import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TalentsPal - Career Platform for Palestinian Students",
  description: "Explore companies, solve exams, prepare for interviews, and analyze your CV & LinkedIn profile",
  keywords: "Palestine, careers, students, graduates, jobs, training, interviews, CV analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
