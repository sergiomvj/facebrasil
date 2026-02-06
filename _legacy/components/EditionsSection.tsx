
import React from 'react';
import { EDITIONS } from '../constants';

const EditionsSection: React.FC = () => {
  return (
    <section className="max-w-[1280px] mx-auto px-6 py-20">
      <div className="flex items-end justify-between mb-10">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight mb-2">Latest Editions</h2>
          <div className="h-1.5 w-20 bg-primary rounded-full"></div>
        </div>
        <a href="#" className="text-primary text-sm font-bold flex items-center gap-1 hover:underline group">
          View Archive <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </a>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {EDITIONS.map((edition) => (
          <div 
            key={edition.id} 
            className="group relative bg-cover bg-center flex flex-col gap-3 rounded-2xl justify-end p-6 aspect-[3/4] overflow-hidden shadow-2xl transition-all duration-500 hover:-translate-y-3 cursor-pointer"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110" 
              style={{ backgroundImage: `url('${edition.image}')` }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/30 to-transparent opacity-90 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative glass-card p-4 rounded-xl border-white/20 transform group-hover:translate-y-[-4px] transition-transform">
              <p className="text-white text-lg font-black leading-tight line-clamp-2">{edition.title}</p>
              <p className="text-white/60 text-xs mt-1 font-bold">{edition.number}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default EditionsSection;
