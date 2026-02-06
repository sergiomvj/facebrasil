
import React, { useState, useEffect } from 'react';
import { LogoSVG } from '../constants';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'glass-header h-16' : 'bg-transparent h-20'}`}>
      <div className="max-w-[1280px] mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="size-8 text-primary group-hover:scale-110 transition-transform">
              <LogoSVG />
            </div>
            <h2 className="text-2xl font-black tracking-tighter text-white">FACEBRASIL</h2>
          </div>
          <nav className="hidden lg:flex items-center gap-8">
            {['Health', 'Wellness', 'Lifestyle', 'Business', 'Events'].map((item) => (
              <a key={item} className="text-sm font-medium text-slate-300 hover:text-primary transition-colors" href="#">
                {item}
              </a>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="relative hidden xl:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
            <input 
              className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary w-64 transition-all focus:w-80" 
              placeholder="Search stories..." 
              type="text" 
            />
          </div>
          <button className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-full text-sm font-bold transition-all shadow-lg shadow-primary/20 active:scale-95">
            Subscribe
          </button>
          <div className="w-10 h-10 rounded-full border-2 border-primary/30 p-0.5 cursor-pointer hover:border-primary transition-colors">
            <div className="w-full h-full rounded-full bg-cover bg-center" style={{ backgroundImage: "url('https://picsum.photos/seed/user123/100/100')" }}></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
