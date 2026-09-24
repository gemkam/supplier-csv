import { Bricolage_Grotesque, Figtree } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--f-display", weight: ["600", "800"] });
const body = Figtree({ subsets: ["latin"], variable: "--f-body", weight: ["400", "500", "600"] });

export const metadata = {
  title: "Catalog Pull",
  description: "Turn a supplier's product catalog into a Shopify import CSV",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
