// Remplace la palette marron/crème par orange / blanc / noir.
// Usage (à la racine du projet Next.js) :  node recolor.mjs
import fs from 'node:fs';
import path from 'node:path';

const REMPLACEMENTS = [
  // --- Orange (accent) ---
  ['#B9763A', '#F26B1D'],   // orange principal : boutons, surtitres, puces
  ['#A8612A', '#D95A10'],   // orange foncé : survol, "20+"
  ['#E8A860', '#FF9A52'],   // orange clair : mots en italique sur fond sombre

  // --- Noir (anciens marrons foncés) ---
  ['#7A4A24', '#141414'],   // footer, bloc contact
  ['#8B5A2B', '#1C1C1C'],   // section "Pourquoi", bandeau /guide
  ['#5C3A21', '#1A1A1A'],   // texte "SÉNÉGAL" du logo
  ['#8C5830', '#F26B1D'],   // texte "SARENATOUR" du logo
  ['#2C221E', '#111111'],   // texte principal

  // --- Blanc (anciens fonds crème) ---
  ['#F7F1E8', '#FFFFFF'],   // fond de page et header
  ['#F0E6D6', '#FFF4EC'],   // fond de la section contact (blanc teinté orange)
  ['#EADBC8', '#EDEDED'],   // traits et bordures
  ['#E3D6C4', '#E5E5E5'],   // bordures des champs et cartes

  // --- Textes gris-marron -> gris neutre ---
  ['#6A5A4A', '#555555'],
  ['#5C4A3A', '#444444'],

  // --- Ombres marron -> ombres noires ---
  ['rgba(90,60,30,', 'rgba(0,0,0,'],
];

const DOSSIERS = ['app', 'components'];
const EXTENSIONS = ['.tsx', '.ts', '.css'];
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

let total = 0;
const visiter = (dir) => {
  if (!fs.existsSync(dir)) return;
  for (const nom of fs.readdirSync(dir)) {
    const chemin = path.join(dir, nom);
    if (fs.statSync(chemin).isDirectory()) { visiter(chemin); continue; }
    if (!EXTENSIONS.includes(path.extname(chemin))) continue;

    let texte = fs.readFileSync(chemin, 'utf8');
    const avant = texte;
    for (const [ancien, nouveau] of REMPLACEMENTS) {
      texte = texte.replace(new RegExp(esc(ancien), 'gi'), nouveau);
    }
    if (texte !== avant) {
      fs.writeFileSync(chemin, texte);
      console.log('modifié :', chemin);
      total++;
    }
  }
};

DOSSIERS.forEach(visiter);
console.log(total ? `Terminé : ${total} fichier(s) modifié(s).` : 'Aucun fichier modifié (déjà fait ?).');
