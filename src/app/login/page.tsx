'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('contato@gcstudio.com.br');
  const [password, setPassword] = useState('••••••••');
  const [loading, setLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/');
    }, 600);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSent(true);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#FBFBF9] text-[#1A1A18] select-none">
      {/* Visual Editorial Left Side */}
      <div className="lg:w-1/2 relative bg-zinc-950 flex flex-col justify-between p-8 sm:p-12 text-white min-h-[340px] lg:min-h-screen overflow-hidden">
        {/* Background Image with Cinematic Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity scale-105 transition-transform duration-1000 ease-out"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1800&q=85')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-transparent to-zinc-950" />

        {/* Top Brand Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900/90 border border-zinc-700/80 backdrop-blur-md flex items-center justify-center p-2 shadow-lg">
            <img src="/logo-white.png" alt="G&C Studio Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="font-serif-brand text-2xl font-semibold tracking-wide text-white">
              G&C Studio
            </span>
            <p className="text-[11px] uppercase tracking-widest text-zinc-400 font-medium">
              Fotografia & Cinema
            </p>
          </div>
        </div>

        {/* Editorial Quote */}
        <div className="relative z-10 max-w-md my-auto pt-8 lg:pt-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] text-[#C5A880] mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sistema Interno de Gestão</span>
          </div>
          <h2 className="font-serif-brand text-3xl sm:text-4xl lg:text-5xl font-light text-white leading-tight tracking-tight">
            Memórias eternizadas com precisão e elegância.
          </h2>
          <p className="text-sm text-zinc-300 mt-4 font-light leading-relaxed">
            Painel exclusivo de controle para clientes, eventos, orçamentos, contratos, briefings e galerias de alta fidelidade.
          </p>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-[11px] text-zinc-500 flex items-center justify-between border-t border-zinc-800/80 pt-4">
          <span>Ambiente Seguro • Administrador</span>
          <span>© 2026 G&C Studio</span>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-[#FFFFFF]">
        <div className="w-full max-w-md space-y-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-[#C5A880] uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4" /> Acesso Administrativo
            </div>
            <h1 className="font-serif-brand text-3xl sm:text-4xl font-medium text-zinc-900 tracking-tight">
              Entrar no Studio
            </h1>
            <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
              Insira suas credenciais da G&C Studio para acessar o painel de eventos.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                E-mail Corporativo
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gcstudio.com.br"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/15 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-zinc-700">Senha</label>
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(true)}
                  className="text-[11px] font-medium text-[#C5A880] hover:text-[#A8875B] transition-colors"
                >
                  Esqueci minha senha
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha secreta"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/15 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-800 active:scale-[0.99] text-white text-xs font-medium flex items-center justify-center gap-2 shadow-sm transition-all duration-200 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Entrar no Painel</span>
                  <ArrowRight className="w-4 h-4 text-[#C5A880]" />
                </>
              )}
            </button>
          </form>

          {/* Forgot Password Modal */}
          {forgotPasswordOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-zinc-200 shadow-xl space-y-4">
                <h3 className="font-serif-brand text-xl font-medium text-zinc-900">
                  Recuperar Senha
                </h3>
                {forgotSent ? (
                  <div className="space-y-3 text-xs text-zinc-600">
                    <p className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200">
                      Instruções de redefinição enviadas para seu e-mail caso esteja cadastrado.
                    </p>
                    <button
                      onClick={() => {
                        setForgotPasswordOpen(false);
                        setForgotSent(false);
                      }}
                      className="w-full py-2 rounded-xl bg-zinc-900 text-white text-xs"
                    >
                      Voltar ao login
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotSubmit} className="space-y-3 text-xs">
                    <p className="text-zinc-500">
                      Informe o e-mail cadastrado na G&C Studio para receber o link de recuperação.
                    </p>
                    <input
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      required
                      placeholder="admin@gcstudio.com.br"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900"
                    />
                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setForgotPasswordOpen(false)}
                        className="flex-1 py-2 rounded-xl border border-zinc-200 text-zinc-700"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2 rounded-xl bg-zinc-900 text-white font-medium"
                      >
                        Enviar link
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 text-[11px] text-zinc-500 flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] mt-1 shrink-0" />
            <p>
              Modo Administrador ativo. O sistema gerencia eventos, contratos, finanças e briefings sem necessidade de múltiplos operadores externos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
