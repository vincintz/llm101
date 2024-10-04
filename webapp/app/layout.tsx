import type { Metadata } from "next"
import { Poppins} from "next/font/google"
import "./globals.css"
import { ClerkProvider } from "@clerk/nextjs";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "LLM 101",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${poppins.variable} font-sans`} >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
