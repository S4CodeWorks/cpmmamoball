import type { NextConfig } from "next";

const securityHeaders = [
  // Bloqueia o app de ser embutido em iframes de outros domínios (anti-clickjacking)
  { key: "X-Frame-Options", value: "DENY" },

  // Impede o browser de "adivinhar" o tipo de arquivo (anti-MIME sniffing)
  { key: "X-Content-Type-Options", value: "nosniff" },

  // Não vaza a URL completa como referrer ao navegar para outros sites
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

  // Desativa APIs sensíveis do browser que o app não usa
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },

  // Força HTTPS por 1 ano (ativo só em produção)
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },

  // Content Security Policy: define de onde o app pode carregar recursos
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://js.hcaptcha.com", // unsafe-* necessário para Next.js dev + RSC
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.supabase.co https://*.hcaptcha.com",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.hcaptcha.com https://challenges.cloudflare.com",
      "frame-src https://challenges.cloudflare.com https://newassets.hcaptcha.com", // iframes do CAPTCHA
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Aplica em todas as rotas
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
