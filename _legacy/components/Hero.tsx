
import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="max-w-[1280px] mx-auto px-6 py-10 pt-28">
      <div className="relative h-[600px] w-full rounded-3xl overflow-hidden group">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" 
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAocP2CPrf04pz3YuneiPEGE_N-LyQREJ6fRX7V-DZe6nGvHF-GKjH4T5kPpn8DcXo-Kgx-K4Ku5ciE0ngDAz9d5rNproVjI8MLV5OoyzN-l73zFRmz9NJSv3CyvpZVX9uEk-4QlKEJhZv_ZObTB1r2SaEXiUZMnpPYtg02H7sd4oGIq_C7xXi78oJRzESjIuVKzXbP-yOqUse3EA_cXrRD2COSASsjYz0Hh-mB3uOWxR14qyJq0FCdu-urnS_YQtnq0SZRh5QrBjY')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/40 to-transparent"></div>
        <div className="absolute bottom-10 left-10 max-w-2xl glass-card p-10 rounded-2xl animate-in fade-in slide-in-from-bottom-5 duration-700">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-4 border border-primary/30">Feature Story</span>
          <h1 className="text-4xl lg:text-5xl font-black leading-tight mb-4 text-white">
            Exploring the Brazilian Spirit in the Heart of America
          </h1>
          <p className="text-slate-300 text-lg mb-8 leading-relaxed">
            A deep dive into the cultural fusion, health trends, and lifestyle of the vibrant Brazilian community across the USA. From the streets of Newark to the beaches of Miami.
          </p>
          <div className="flex items-center gap-6">
            <button className="bg-primary text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:translate-y-[-2px] hover:shadow-xl hover:shadow-primary/30 transition-all">
              Read Feature <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
            <span className="text-slate-400 text-sm font-medium">12 min read • By Isabella Silva</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
