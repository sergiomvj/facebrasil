import React from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { LogoSVG } from '@/lib/constants';

const Footer: React.FC = () => {
  const t = useTranslations('Footer');
  const tNav = useTranslations('Navbar');

  const currentYear = new Date().getFullYear();

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
              {t('about')}
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
            <h4 className="dark:text-white text-gray-900 font-bold mb-6">{t('categories')}</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link className="hover:text-primary transition-colors" href="/category/saude-bem-estar">{tNav('categories.health')} & {tNav('categories.wellbeing')}</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/category/negocios-carreira">{tNav('categories.business')}</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/category/estilo-de-vida-artes">{tNav('categories.lifestyle')}</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/events">{tNav('events')} & {tNav('community')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="dark:text-white text-gray-900 font-bold mb-6">{t('magazine')}</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link className="hover:text-primary transition-colors" href="/digital-editions">{t('digitalEditions')}</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/subscription">{t('printSubscription')}</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/advertise">{t('advertise')}</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/ambassador">{t('ambassador')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="dark:text-white text-gray-900 font-bold mb-6">{t('support')}</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link className="hover:text-primary transition-colors" href="/about">{t('aboutUs')}</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/contact">{t('contact')}</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/privacy">{t('privacy')}</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/terms">{t('terms')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">© {currentYear} FACEBRASIL Magazine. {t('rights')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
