import type { Metadata } from "next";
import { Poppins, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AppSidebar, WithSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { Topbar } from "@/components/topbar";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dexpress",
  description: "Painel de gestão para transportadora",
  icons: { icon: "/images/favicon.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${poppins.variable} ${geistMono.variable} antialiased font-sans`}>
        <Providers>
          <WithSidebar>
            <AppSidebar />
            <SidebarInset className="bg-muted">
              <Topbar />
              <div className="p-4 md:p-6">{children}</div>
            </SidebarInset>
          </WithSidebar>
        </Providers>
      </body>
    </html>
  );
}
