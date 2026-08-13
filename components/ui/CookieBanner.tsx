'use client';

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Modal } from './Primitives';

/**
 * Banner de cookies/armazenamento local — controla só o que é salvo no
 * navegador do visitante (tema, favoritos, notificações). Dados da CONTA
 * (Supabase, usuário logado) não passam por aqui.
 */
export function CookieBanner() {
  const { cookieConsent, setCookieConsent, resolvedTheme } = useApp();
  const [termsOpen, setTermsOpen] = useState(false);
  const linkColor = resolvedTheme === 'dark' ? '#7ab8ff' : '#0969da';

  if (cookieConsent !== 'unset') return null;

  return (
    <>
      <div
        role="region"
        aria-label="Aviso de cookies"
        className="snackbar"
        style={{
          position: 'absolute', bottom: 96, left: 16, right: 16, zIndex: 80,
          flexDirection: 'column', alignItems: 'stretch', gap: 12,
          padding: '16px', maxWidth: 340, margin: '0 auto',
        }}
      >
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: 'var(--on-surface)' }}>
          Usamos armazenamento local pra melhorar sua experiência.{' '}
          <button
            onClick={() => setTermsOpen(true)}
            style={{ color: linkColor, textDecoration: 'underline dotted', textUnderlineOffset: 3, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
          >
            Termos
          </button>
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setCookieConsent('declined')} className="btn btn-outlined" style={{ flex: 1, height: 40, fontSize: 13.5 }}>
            Recusar
          </button>
          <button onClick={() => setCookieConsent('accepted')} className="btn btn-primary" style={{ flex: 1, height: 40, fontSize: 13.5 }}>
            Aceitar
          </button>
        </div>
      </div>

      <Modal open={termsOpen} onClose={() => setTermsOpen(false)} title="Termos e Privacidade" maxWidth={440}>
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
    </>
  );
}
