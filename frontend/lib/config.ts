/* ====== À MODIFIER SI BESOIN ====== */
export const API = 'http://127.0.0.1:8000';
export const WA_NUMBER = '221774637704';          // format international, sans +
export const PHONE_DISPLAY = '+221 77 463 77 04';
export const EMAIL = 'ongom9611@gmail.com';
/* ================================== */

// URL d'une image servie par Laravel (gère les espaces dans les noms de fichiers)
export const imgUrl = (img?: string | null) => {
  if (!img) return '';
  if (img.startsWith('http')) return img;
  const path = img.startsWith('/') ? img.slice(1) : img;
  return encodeURI(path.startsWith('images/') ? `${API}/${path}` : `${API}/images/${path}`);
};

export const waLink = (text = '') =>
  `https://wa.me/${WA_NUMBER}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
