"use client";
// src/components/MobileMenu.tsx
// Premium responsive mobile navigation menu for ReviewCartDeals
// This component matches the dark‑gold aesthetic used throughout the site.

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import type { Category } from '@/payload-types';

interface MobileMenuProps {
  /** Array of categories fetched from the Payload CMS */
  categories: Category[];
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ categories }) => {
  const [open, setOpen] = useState(false);

  const toggleMenu = () => setOpen(!open);

  return (
    <div className="relative md:hidden">
      {/* Hamburger button */}
      <button
        onClick={toggleMenu}
        aria-label={open ? 'Close menu' : 'Open menu'}
        className="flex items-center gap-2 rounded p-2 text-[#D4AF37] hover:text-white transition-colors"
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        <span className="sr-only">Menu</span>
      </button>

      {/* Slide‑over panel */}
      <div
        className={`fixed inset-0 z-40 bg-[#050505]/98 backdrop-blur-xl transition-transform duration-300 border-r border-[#D4AF37]/20 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!open}
      >
        <div className="flex h-full flex-col p-6">
          {/* Close button at top */}
          <div className="flex justify-between items-center w-full mb-8">
            <span className="font-serif text-xl font-bold tracking-widest uppercase text-[#D4AF37]">
              Menu
            </span>
            <button
              onClick={toggleMenu}
              aria-label="Close menu"
              className="rounded p-2 text-[#D4AF37] hover:text-white transition-colors bg-[#111111] border border-[#D4AF37]/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Category list */}
          <nav className="space-y-4 overflow-y-auto">
            <Link
              href="/search"
              className="block rounded-xl px-5 py-3.5 text-sm font-bold tracking-widest uppercase text-[#050505] bg-[#D4AF37] hover:bg-[#C5A059] transition-colors"
              onClick={toggleMenu}
            >
              ALL COLLECTIONS
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="block rounded-xl px-5 py-3 text-sm font-semibold tracking-wider uppercase text-gray-300 hover:bg-[#111111] hover:text-[#D4AF37] border border-transparent hover:border-[#D4AF37]/20 transition-all"
                onClick={toggleMenu}
              >
                {cat.title}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
