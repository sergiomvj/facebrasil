import React from 'react';
import Link from 'next/link';
import { LogoSVG } from '@/lib/constants';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/10 pt-20 pb-10 mt-20">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="size-6 text-primary">
                <LogoSVG />
              </div>
              <h2 className="text-xl font-black tracking-tighter dark:text-white text-gray-900">FACEBRASIL</h2>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              The leading digital voice for the Brazilian community in the USA, celebrating culture, success, and lifestyle since 2010.
            </p>
            <div className="flex gap-4">
              {['public', 'alternate_email', 'camera'].map((icon) => (
                <Link key={icon} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 text-slate-400" href="#">
                  <span className="material-symbols-outlined text-xl">{icon}</span>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="dark:text-white text-gray-900 font-bold mb-6">Categorias</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link className="hover:text-primary transition-colors" href="/category/saude-bem-estar">Saúde & Bem-estar</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/category/negocios-carreira">Negócios & Carreira</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/category/estilo-de-vida-artes">Estilo de Vida & Artes</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/events">Eventos & Comunidade</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="dark:text-white text-gray-900 font-bold mb-6">Revista</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link className="hover:text-primary transition-colors" href="/digital-editions">Edições Digitais</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/subscription">Assinatura Impressa</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/advertise">Anuncie Conosco</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/ambassador">Seja nosso Embaixador</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="dark:text-white text-gray-900 font-bold mb-6">Suporte</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link className="hover:text-primary transition-colors" href="/about">Sobre Nós</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/contact">Contato</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/privacy">Política de Privacidade</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/terms">Termos de Uso</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">© 2024 FACEBRASIL Magazine. All rights reserved.</p>
          <div className="flex gap-6 text-[10px] uppercase font-bold tracking-widest text-slate-500">
            <Link className="hover:text-white transition-colors cursor-pointer" href="#">English</Link>
            <Link className="hover:text-white transition-colors cursor-pointer" href="#">Português</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
