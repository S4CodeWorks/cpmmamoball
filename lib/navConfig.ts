import type { Page } from '@/lib/types';

export const NAV_ITEMS = [
  { id: 'home',        label: 'Início',   icon: 'home',       filled: 'homeFilled'      },
  { id: 'tournaments', label: 'Tabela',   icon: 'trophy',     filled: 'trophyFilled'    },
  { id: 'jogos',       label: 'Jogos',    icon: 'calendar',   filled: 'calendarFilled'  },
  { id: 'news',        label: 'Notícias', icon: 'news',       filled: 'newsFilled'      },
  { id: 'more',        label: 'Mais',     icon: 'menuDotsH',  filled: 'menuDotsHFilled' },
] as const;

export function resolveActive(page: Page): string | null {
  if (['home', 'tournaments', 'jogos', 'news', 'more'].includes(page)) return page;
  if (['profile', 'saved', 'subscription', 'rules', 'support', 'search', 'admin', 'settings'].includes(page)) return 'more';
  if (page === 'match') return 'jogos';
  if (page === 'club') return 'tournaments';
  if (page === 'article') return 'news';
  return null;
}
