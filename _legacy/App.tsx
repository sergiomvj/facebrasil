
import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ArticleCard from './components/ArticleCard';
import Newsletter from './components/Newsletter';
import EditionsSection from './components/EditionsSection';
import Footer from './components/Footer';
import { ARTICLES } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Latest Stories');

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <Hero />

        {/* Categories / Tabs */}
        <section className="max-w-[1280px] mx-auto px-6 mb-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-1">
            <div className="flex gap-10">
              {['Latest Stories', 'Trending', 'Editors\' Choice'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative pb-4 text-sm font-bold transition-all duration-300 ${activeTab === tab ? 'text-primary' : 'text-slate-400 hover:text-white'}`}
                >
                  {tab}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full animate-in fade-in zoom-in duration-300"></span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex gap-2 pb-4">
              <button className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
                <span className="material-symbols-outlined text-lg">grid_view</span>
              </button>
              <button className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
                <span className="material-symbols-outlined text-lg">list</span>
              </button>
            </div>
          </div>
        </section>

        {/* Article Grid */}
        <section className="max-w-[1280px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ARTICLES.map((article, index) => (
              <div 
                key={article.id} 
                className="animate-in fade-in slide-in-from-bottom-5 duration-500" 
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ArticleCard article={article} />
              </div>
            ))}
            
            {/* Newsletter is usually placed in the grid in this type of layout */}
            <div className="animate-in fade-in slide-in-from-bottom-5 duration-500" style={{ animationDelay: '600ms' }}>
              <Newsletter />
            </div>
          </div>
        </section>

        {/* Featured Editions Section - Combined from layout 2 */}
        <EditionsSection />

        {/* Load More Button */}
        <div className="flex justify-center mt-8">
          <button className="group px-8 py-3 rounded-full border border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-all text-sm font-bold flex items-center gap-2 text-slate-300">
            Discover More Stories 
            <span className="material-symbols-outlined text-lg group-hover:translate-y-1 transition-transform">expand_more</span>
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default App;
