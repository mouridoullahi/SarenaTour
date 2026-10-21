import Navbar from './Navbar';
import WhatsAppIcon from './WhatsAppIcon';
import { WA_NUMBER } from '../lib/config';

// En-tête des pages secondaires (/guide) : la même barre que l'accueil + le bouton rond WhatsApp
export default function SiteHeader() {
  return (
    <>
      <Navbar />
      <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
         className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1EBE5A] text-white grid place-items-center shadow-xl transition">
        <WhatsAppIcon size={30} />
      </a>
    </>
  );
}
