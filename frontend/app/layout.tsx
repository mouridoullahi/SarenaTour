import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import "./globals.css";

// Nouvelles polices : titres en sans-serif moderne, texte en DM Sans.
// (Les noms de variables restent les mêmes, donc rien d'autre à modifier.)
const titres = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-serif" });
const texte = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "SarenaTour – excursions et circuits au Sénégal",
  description: "Safari, désert de Lompoul, île de Gorée, Saly, Lac Rose… excursions sur mesure au Sénégal.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${titres.variable} ${texte.variable} scroll-smooth`}>
      <body className="font-[family-name:var(--font-sans)]">{children}</body>
    </html>
  );
}
