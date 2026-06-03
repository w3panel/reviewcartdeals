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
        className="flex items-center gap-2 rounded p-2 text-gray-300 hover:text-luxury-gold transition-colors"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        <span className="sr-only">Menu</span>
      </button>

      {/* Slide‑over panel */}
      <div
        className={`fixed inset-0 z-40 bg-luxury-black/95 backdrop-blur-md transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!open}
      >
        <div className="flex h-full flex-col p-4">
          {/* Close button at top */}
          <button
            onClick={toggleMenu}
            aria-label="Close menu"
            className="self-end rounded p-2 text-gray-300 hover:text-luxury-gold transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Category list */}
          <nav className="mt-8 space-y-4 overflow-y-auto">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="block rounded px-4 py-2 text-sm font-medium text-gray-300 hover:bg-luxury-gray hover:text-luxury-gold transition-colors"
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
