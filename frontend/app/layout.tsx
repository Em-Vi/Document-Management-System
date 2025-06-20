import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/Authcontext";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "SAIL DMS",
  description: "Created by EmVi",
  icons: {
    icon: "/favicon.png",
  },
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="en">
      <body>
          <AuthProvider>{children}</AuthProvider>
          <Toaster />
      </body>
    </html>
  );
}
