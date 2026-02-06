
import React from 'react';
import { LogoSVG } from '../constants';

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
              <h2 className="text-xl font-black tracking-tighter text-white">FACEBRASIL</h2>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              The leading digital voice for the Brazilian community in the USA, celebrating culture, success, and lifestyle since 2010.
            </p>
            <div className="flex gap-4">
              {['public', 'alternate_email', 'camera'].map((icon) => (
                <a key={icon} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 text-slate-400" href="#">
                  <span className="material-symbols-outlined text-xl">{icon}</span>
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6">Sections</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              {['Health & Wellness', 'Business & Career', 'Lifestyle & Arts', 'Events & Community'].map((link) => (
                <li key={link}><a className="hover:text-primary transition-colors" href="#">{link}</a></li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6">Magazine</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              {['Digital Editions', 'Print Subscription', 'Advertise with Us', 'Distribution Points'].map((link) => (
                <li key={link}><a className="hover:text-primary transition-colors" href="#">{link}</a></li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6">Support</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              {['Contact Us', 'Privacy Policy', 'Terms of Service', 'Careers'].map((link) => (
                <li key={link}><a className="hover:text-primary transition-colors" href="#">{link}</a></li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">© 2024 FACEBRASIL Magazine. All rights reserved.</p>
          <div className="flex gap-6 text-[10px] uppercase font-bold tracking-widest text-slate-500">
            <a className="hover:text-white transition-colors cursor-pointer" href="#">English</a>
            <a className="hover:text-white transition-colors cursor-pointer" href="#">Português</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
