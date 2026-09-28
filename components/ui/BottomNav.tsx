'use client';

import { I } from '@/components/icons';
import { NAV_ITEMS, resolveActive } from '@/lib/navConfig';
import type { Page } from '@/lib/types';

interface BottomNavProps {
  page: Page;
  onNav: (id: string) => void;
}

export function BottomNav({ page, onNav }: BottomNavProps) {
  const active = resolveActive(page);
  return (
    <div className="bottom-nav" role="tablist">
      {NAV_ITEMS.map(it => {
        const isActive = active === it.id;
        return (
          <button
            key={it.id}
            className={`bottom-nav-item tap${isActive ? ' is-active' : ''}`}
            onClick={() => onNav(it.id)}
            role="tab"
            aria-selected={isActive}
          >
            <span className="ind" aria-hidden="true">
              {isActive ? I[it.filled as keyof typeof I] : I[it.icon as keyof typeof I]}
            </span>
            <span className="label">{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}
