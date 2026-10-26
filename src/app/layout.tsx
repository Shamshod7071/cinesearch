import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Navbar from "@/components/Navbar";
import SetupNotice from "@/components/SetupNotice";
import { clerkReady } from "@/lib/clerkReady";
import "./globals.css";

export const metadata: Metadata = {
  title: "CineSearch",
  description: "Discover movies and TV shows with the TMDB catalog",
};

export const viewport: Viewport = { themeColor: "#0b0b0f" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  if (!clerkReady) {
    return (
      <html lang="en">
        <body><SetupNotice /></body>
      </html>
    );
  }
  return (
    <ClerkProvider
      signInUrl="/login"
      signUpUrl="/sign-up"
      appearance={{
        baseTheme: dark,
        variables: { colorPrimary: "#e11d48", colorBackground: "#15151c", colorInputBackground: "#0b0b0f", borderRadius: "10px" },
      }}
    >
      <html lang="en">
        <body>
          <Navbar />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
