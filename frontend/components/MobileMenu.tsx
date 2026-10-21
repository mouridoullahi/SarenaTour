'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';

// Bouton "trois traits" visible seulement sur téléphone (md:hidden)
export default function MobileMenu({ links }: { links: string[][] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
        aria-expanded={open}
        className="w-11 h-11 rounded-full border border-[#E5E5E5] bg-white/70 text-[#1A1A1A] grid place-items-center"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {open && (
        <nav className="absolute top-full inset-x-0 bg-[#FFFFFF] border-b border-[#EDEDED] shadow-xl px-6 py-4 flex flex-col">
          {links.map(([label, href]) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="py-3 text-base font-medium text-[#111111] border-b border-[#EDEDED] last:border-0 hover:text-[#F26B1D]"
            >
              {label}
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}
