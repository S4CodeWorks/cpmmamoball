'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { Modal } from './Primitives';
import { CpmAction, CpmIcon } from './CpmUi';

/** Visitor browser preferences; account storage keeps its existing independent consent. */
export function CookieBanner({ surface }: { surface: string }) {
  const { cookieConsent, setCookieConsent } = useApp();
  const [termsOpen, setTermsOpen] = useState(false);
  const banner = useRef<HTMLElement>(null), reduced = useReducedMotion();
  useEffect(() => {
    if (cookieConsent !== 'unset' || !banner.current) return;
    const element = banner.current, root = element.closest<HTMLElement>('.app-root');
    if (!root) return;
    const measure = () => {
      root.dataset.cookieNotice = 'visible';
      const bottom = parseFloat(getComputedStyle(element).bottom) || 0;
      root.style.setProperty('--cpm-cookie-clearance', `${Math.ceil(element.getBoundingClientRect().height + bottom + 24)}px`);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    const nav = root.querySelector('.bottom-nav');
    if (nav) observer.observe(nav);
    measure(); window.addEventListener('resize', measure);
    return () => { observer.disconnect(); window.removeEventListener('resize', measure); delete root.dataset.cookieNotice; root.style.removeProperty('--cpm-cookie-clearance'); };
  }, [cookieConsent, surface]);

  return <>
    <AnimatePresence>{cookieConsent === 'unset' && <motion.aside ref={banner} className="cpm-cookie-notice" aria-label="Aviso de cookies" initial={false} exit={reduced ? undefined : { opacity: 0 }} transition={{ duration: 0.12, ease: 'easeOut' }}>
      <div className="cpm-cookie-information">
        <span className="cpm-cookie-icon"><CpmIcon name="cookie" /></span>
        <div className="cpm-cookie-copy"><h2>Suas preferências</h2><p>Guarde tema, favoritos e avisos neste navegador.</p></div>
      </div>
      <div className="cpm-cookie-controls">
        <button type="button" className="cpm-cookie-terms" onClick={() => setTermsOpen(true)}><CpmIcon name="rules" />Termos</button>
        <div className="cpm-cookie-choices"><button type="button" className="cpm-cookie-refusal" onClick={() => setCookieConsent('declined')}>Recusar</button><CpmAction primary onClick={() => setCookieConsent('accepted')}>Aceitar</CpmAction></div>
      </div>
    </motion.aside>}</AnimatePresence>
      <Modal accessible open={termsOpen} onClose={() => setTermsOpen(false)} title="Termos e Privacidade" maxWidth={440}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13.5, lineHeight: 1.6, color: 'var(--on-surface-variant)' }}>
          <p style={{ margin: 0 }}>
            Este é um texto genérico de exemplo — o conteúdo legal de verdade ainda não foi
            escrito. Ele serve só pra mostrar onde os termos vão aparecer.
          </p>
          <p style={{ margin: 0 }}>
            <strong style={{ color: 'var(--on-surface)' }}>Armazenamento local:</strong> guardamos
            preferências como tema, clubes favoritos e notificações diretamente no seu navegador.
            Nada disso é enviado a terceiros.
          </p>
          <p style={{ margin: 0 }}>
            <strong style={{ color: 'var(--on-surface)' }}>Dados de conta:</strong> se você cria uma
            conta, informações como e-mail e apelido ficam guardadas nos nossos servidores pra
            fazer o login funcionar — isso é regido por um consentimento separado, aceito no
            cadastro.
          </p>
        </div>
      </Modal>
  </>;
}
