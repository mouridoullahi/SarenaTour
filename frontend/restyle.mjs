// Change la forme du site : coins moins arrondis, boutons rectangulaires.
// Usage (racine du projet Next.js) :  node restyle.mjs
import fs from 'node:fs';
import path from 'node:path';

const COINS = [
  ['rounded-[2.5rem]', 'rounded-lg'], ['rounded-[2rem]', 'rounded-lg'],
  ['rounded-3xl', 'rounded-lg'], ['rounded-2xl', 'rounded-lg'], ['rounded-xl', 'rounded-lg'],
];
let total = 0;

const visiter = (dir) => {
  if (!fs.existsSync(dir)) return;
  for (const nom of fs.readdirSync(dir)) {
    const p = path.join(dir, nom);
    if (fs.statSync(p).isDirectory()) { visiter(p); continue; }
    if (!p.endsWith('.tsx')) continue;

    const avant = fs.readFileSync(p, 'utf8');
    // On ne touche qu'aux attributs className="..." ou className={`...`}
    const apres = avant.replace(/className=("[^"]*"|\{`[^`]*`\})/g, (bloc) => {
      let b = bloc;
      for (const [a, n] of COINS) b = b.split(a).join(n);
      // Boutons (classes contenant px-) : pilule -> rectangle légèrement arrondi
      if (b.includes('px-') && b.includes('rounded-full')) b = b.split('rounded-full').join('rounded-md');
      return b;
    });
    if (apres !== avant) { fs.writeFileSync(p, apres); console.log('modifié :', p); total++; }
  }
};
['app', 'components'].forEach(visiter);
console.log(`Terminé : ${total} fichier(s) modifié(s).`);
