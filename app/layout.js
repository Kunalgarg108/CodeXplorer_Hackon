import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "600"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});

export const metadata = {
  title: "FinanSmart — AI-Powered Personal Finance",
  description:
    "FinanSmart gives you an AI-driven personal finance advisor to track budgets, income streams, and expenses with clarity.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
        <body
          style={{
            background: "#000814",
            color: "#ffffff",
            fontFamily: "var(--font-inter), 'Inter', ui-sans-serif, system-ui, sans-serif",
            fontWeight: 300,
          }}
        >
          <Toaster
            toastOptions={{
              style: {
                background: "#010d1e",
                border: "1px solid rgba(17,38,59,0.8)",
                color: "#ffffff",
                borderRadius: "14px",
              },
            }}
          />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
