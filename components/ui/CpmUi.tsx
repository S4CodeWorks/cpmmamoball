'use client';
import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
const assets = {
 matchAssist: 'match/64-42513', matchShare: 'match/21-24682', matchBell: 'match/21-24678', matchBall: 'match/21-24674',
 authMail: 'auth/54-8007', authLock: 'auth/54-8011', authEye: 'auth/54-8015', authEyeOff: 'auth/54-8018',
 authBack: 'auth/54-8021', authLogin: 'auth/54-8024', authAlert: 'auth/54-8028', authShield: 'auth/54-8031', authBell: 'auth/54-8034', authCheck: 'auth/54-8911', libraryBall: 'auth/21-24674',
 cookie: 'cookie', search: '2-112', chevron: '2-115', user: '2-119', moon: '2-122', menu: '2-125',
 arrow: '2-128', ticket: '2-885', bookmark: '2-888', rules: '2-892', support: '2-898',
 settings: '2-902', calendar: '3-1144', check: '3-1147', star: '3-1150', clock: '3-1154',
 trophy: '3-1158', eventArrow: '4-3067', sun: '8-16187',
 eventTrophy: 'event/I4-1700-4-2936', eventCheck: 'event/I4-1700-4-2941', eventClock: 'event/I4-1700-4-3041',
 classificationBall: 'classification-ball', classificationBell: 'classification-bell',
 classificationShare: 'classification-share', classificationRules: 'classification-rules',
 classificationMenuDots: 'classification-menuDotsH', classificationChevronUp: 'classification-chevronUp',
 searchClose: '42-40209', searchNews: '42-40213', searchShield: '42-40216', searchBack: '42-40219',
 searchChevron: '42-40222', searchAlert: '42-40226', searchFilter: '42-40229',
} as const;
export type CpmIconName = keyof typeof assets;
/** Original exported SVG silhouettes, retaining every path and contextual stroke. */
export function CpmIcon({ name, className = '' }: { name: CpmIconName; className?: string }) {
 return <span aria-hidden="true" className={'cpm-icon '+className} style={{ '--cpm-icon-url': 'url("/cpm-icons/'+assets[name]+'.svg")' } as CSSProperties} />;
}
export function CpmAction({ children, onClick, primary = false }: { children: ReactNode; onClick: () => void; primary?: boolean }) {
 return <motion.button type="button" onClick={onClick} className={'cpm-button '+(primary?'cpm-button-primary':'cpm-button-text')} whileTap={{ scale: 0.98 }} transition={{ duration: 0.12 }}>{children}</motion.button>;
}
export function CpmPopover({ label, trigger, children, className = '', disabled = false, role = 'menu' }: {
 label: string; trigger: ReactNode; children: (close: () => void) => ReactNode; className?: string; disabled?: boolean; role?: 'menu' | 'listbox';
}) {
 const [open, setOpen] = useState(false);
 const root = useRef<HTMLDivElement>(null), button = useRef<HTMLButtonElement>(null), panel = useRef<HTMLDivElement>(null);
 const keyboardOpen = useRef(false), id = useId(), reduced = useReducedMotion();
 const close = () => { setOpen(false); };
 useEffect(() => {
  if (!open) { if (keyboardOpen.current) button.current?.focus(); return; }
  if (keyboardOpen.current) panel.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus();
  const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) { keyboardOpen.current=false; setOpen(false); } };
  const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); setOpen(false); button.current?.focus(); } };
  document.addEventListener('pointerdown', outside); document.addEventListener('keydown', escape);
  return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
 }, [open]);
 return <div className={'cpm-popover '+className} ref={root} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false); }}>
  <motion.button type="button" ref={button} className={'cpm-popover-trigger'+(open?' is-open':'')} aria-label={label} aria-haspopup={role} aria-expanded={open} aria-controls={open?id:undefined} disabled={disabled}
   onClick={event => { keyboardOpen.current=event.detail===0; setOpen(value=>!value); }}
   onKeyDown={event => { if (event.key==='ArrowDown'||event.key==='ArrowUp') { event.preventDefault(); keyboardOpen.current=true;setOpen(true); } }} whileTap={{scale:0.98}}>{trigger}</motion.button>
  <AnimatePresence>{open&&<motion.div id={id} role={role} aria-label={label} ref={panel} className="cpm-popover-panel" initial={{opacity:0,y:reduced?0:-4}} animate={{opacity:1,y:0}} exit={{opacity:0,y:reduced?0:-2}} transition={{duration:0.12,ease:'easeOut'}}
   onKeyDown={event=>{
    if (!['ArrowDown','ArrowUp','Home','End'].includes(event.key)) return;
    event.preventDefault();const items=[...event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')];const at=items.indexOf(document.activeElement as HTMLButtonElement);
    const next=event.key==='Home'?0:event.key==='End'?items.length-1:(at+(event.key==='ArrowUp'?-1:1)+items.length)%items.length;items[next]?.focus();
   }}>{children(close)}</motion.div>}</AnimatePresence>
 </div>;
}
export function CpmMenuItem({icon,children,onClick}:{icon:CpmIconName;children:ReactNode;onClick:()=>void}) {
 return <button type="button" role="menuitem" className="cpm-menu-item" onClick={onClick}><span className="cpm-menu-icon"><CpmIcon name={icon}/></span><span className="cpm-menu-label">{children}</span></button>;
}
