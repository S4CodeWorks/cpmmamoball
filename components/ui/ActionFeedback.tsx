'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useApp, type ToastVariant } from '@/contexts/AppContext';
import { CpmIcon, type CpmIconName } from './CpmUi';

const icons: Record<ToastVariant, CpmIconName> = {
  success: 'bookmark', undo: 'bookmark', restored: 'authCheck', copied: 'matchShare',
  pending: 'feedbackProgress', error: 'authAlert', warning: 'authBell', info: 'authShield',
};

/** One viewport host. A new operation waits behind an actionable failure. */
export function ActionFeedback() {
  const { toast, hideToast, showError } = useApp();
  const reduced = useReducedMotion(), root = useRef<HTMLDivElement>(null);
  const callbacks = useRef({ hideToast, showError });
  useEffect(() => { callbacks.current = { hideToast, showError }; });
  const [hover, setHover] = useState(false), [focus, setFocus] = useState(false);
  const [active, setActive] = useState(true), [keyboard, setKeyboard] = useState(0);
  const remaining = useRef(0);
  const duration = toast?.action || toast?.variant === 'info' ? 8000 : 4000;
  const persistent = toast && ['error', 'warning', 'pending'].includes(toast.variant);
  useEffect(() => {
    const visible = () => setActive(document.visibilityState === 'visible');
    visible(); document.addEventListener('visibilitychange', visible);
    const viewport = window.visualViewport;
    const resize = () => setKeyboard(viewport ? Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop) : 0);
    resize(); viewport?.addEventListener('resize', resize); viewport?.addEventListener('scroll', resize);
    return () => { document.removeEventListener('visibilitychange', visible); viewport?.removeEventListener('resize', resize); viewport?.removeEventListener('scroll', resize); };
  }, []);
  useEffect(() => { remaining.current = duration; }, [toast?.id, toast?.msg, toast?.variant, duration]);
  useEffect(() => {
    if (!toast || persistent || hover || focus || !active) return;
    const started = Date.now();
    const timer = setTimeout(() => callbacks.current.hideToast(), remaining.current);
    return () => { clearTimeout(timer); remaining.current = Math.max(0, remaining.current - (Date.now() - started)); };
  }, [toast, persistent, hover, focus, active]);
  return <div className="cpm-feedback-host" style={{ '--cpm-keyboard-offset': keyboard + 'px' } as CSSProperties}>
    <AnimatePresence mode="wait">
      {toast && <motion.div key={toast.id} ref={root} className={'cpm-action-feedback is-' + toast.variant + (toast.action ? ' has-action' : '')}
        initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : 4, transition: { duration: reduced ? 0 : .12 } }}
        transition={{ duration: reduced ? 0 : .18, ease: 'easeOut' }}
        onHoverStart={() => setHover(true)} onHoverEnd={() => setHover(false)}
        onFocusCapture={() => setFocus(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocus(false); }}
        onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); hideToast(); } }}>
        <div className="cpm-feedback-content">
          <span className="cpm-feedback-badge"><CpmIcon name={toast.icon ?? icons[toast.variant]}/></span>
          <span className="cpm-feedback-message" key={toast.id + toast.variant + toast.msg} role={toast.variant === 'error' ? 'alert' : 'status'} aria-atomic="true">{toast.msg}</span>
          {toast.action && <button type="button" className="cpm-feedback-action" onClick={() => {
            const action = toast.action!;
            if (!action.keepOpen) hideToast();
            try { Promise.resolve(action.onClick()).catch(error => callbacks.current.showError(error)); }
            catch (error) { callbacks.current.showError(error); }
          }}>{toast.action.label}</button>}
          {toast.variant !== 'pending' && <button type="button" className="cpm-feedback-close" aria-label="Fechar aviso" onClick={hideToast}><CpmIcon name="searchClose"/></button>}
        </div>
        {toast.variant === 'pending' && <div className="cpm-feedback-progress" aria-hidden="true"><span/></div>}
      </motion.div>}
    </AnimatePresence>
  </div>;
}
