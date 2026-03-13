"use client";

import React, { useEffect, useState } from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { LogoSVG } from '@/lib/constants';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Facebook, Instagram, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
  const t = useTranslations('Footer');
  const tNav = useTranslations('Navbar');
  const [dynamicData, setDynamicData] = useState<any>(null);
  const { locale } = useParams();
  const supabase = createClient();

  useEffect(() => {
    async function loadFooterData() {
      try {
        const { data, error } = await supabase
          .from('static_pages')
          .select('content')
          .eq('slug', 'footer')
          .eq('language', locale || 'pt')
          .single();

        if (data?.content) {
          setDynamicData(JSON.parse(data.content));
        }
      } catch (err) {
        console.error('Error loading dynamic footer:', err);
      }
    }
    loadFooterData();
  }, [locale]);

  const socialLinks = dynamicData?.social_links || {
    facebook: "https://facebook.com/facebrasil",
    instagram: "https://instagram.com/facebrasil",
    youtube: "https://youtube.com/facebrasil",
    linkedin: "https://linkedin.com/company/facebrasil"
  };

  const companyDescription = dynamicData?.company_description || t('about'); // Changed from t('aboutText') to t('about') to match original translation key
  const footerColumns = dynamicData?.columns || [
    {
      title: t('categories'), // Changed from t('categoriesTitle') to t('categories')
      links: [
        { label: tNav('categories.health'), url: "/category/saude" }, // Using tNav and original paths
        { label: tNav('categories.wellbeing'), url: "/category/bem-estar" },
        { label: tNav('categories.lifestyle'), url: "/category/estilo-de-vida" },
        { label: tNav('categories.business'), url: "/category/negocios" },
      ]
    },
    {
      title: t('magazine'), // Changed from t('facebrasilTitle') to t('magazine')
      links: [
        { label: t('digitalEditions'), url: "/digital-editions" }, // Using original translation keys and paths
        { label: t('printSubscription'), url: "/subscription" },
        { label: t('advertise'), url: "/advertise" },
        { label: t('ambassador'), url: "/ambassador" },
      ]
    },
    {
      title: t('support'), // Changed from t('supportTitle') to t('support')
      links: [
        { label: t('aboutUs'), url: "/about" },
        { label: t('contact'), url: "/contact" },
        { label: t('privacy'), url: "/privacy" },
        { label: t('terms'), url: "/terms" },
      ]
    }
  ];

  const currentYear = new Date().getFullYear(); // Kept from original code for copyright

  return (
    <footer className="dark:bg-slate-950 bg-white border-t dark:border-white/5 border-gray-100 py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Info */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-black tracking-tighter dark:text-white text-gray-900">
                FACE<span className="text-primary italic">BRASIL</span>
              </span>
            </Link>
            <p className="dark:text-slate-400 text-gray-600 text-sm leading-relaxed max-w-xs">
              {companyDescription}
            </p>
            <div className="flex items-center gap-4">
              <a href={socialLinks.facebook} className="w-10 h-10 rounded-full dark:bg-slate-900 bg-gray-50 flex items-center justify-center dark:text-slate-400 text-gray-500 hover:bg-primary hover:text-slate-900 transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href={socialLinks.instagram} className="w-10 h-10 rounded-full dark:bg-slate-900 bg-gray-50 flex items-center justify-center dark:text-slate-400 text-gray-500 hover:bg-primary hover:text-slate-900 transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href={socialLinks.youtube} className="w-10 h-10 rounded-full dark:bg-slate-900 bg-gray-50 flex items-center justify-center dark:text-slate-400 text-gray-500 hover:bg-primary hover:text-slate-900 transition-all">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Dynamic Columns */}
          {footerColumns.map((column: any, idx: number) => (
            <div key={idx} className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] dark:text-slate-500 text-gray-400">
                {column.title}
              </h4>
              <ul className="space-y-4">
                {column.links.map((link: any, lIdx: number) => (
                  <li key={lIdx}>
                    <Link href={link.url} className="text-sm dark:text-slate-400 text-gray-600 dark:hover:text-white hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t dark:border-white/5 border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs dark:text-slate-500 text-gray-400 font-medium">
            {dynamicData?.copyright || `© ${currentYear} FACEBRASIL Magazine. ${t('rights')}`}
          </p>
          <div className="flex gap-6">
            {/* Additional bottom links if needed */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
