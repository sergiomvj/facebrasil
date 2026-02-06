'use client';

import React from 'react';
import { Mail } from 'lucide-react';

const MailNewsletter: React.FC = () => {
  return (
    <div className="glass-card rounded-2xl p-8 flex flex-col justify-center border-primary/20 bg-primary/5 h-full">
      <div className="text-primary mb-4 bg-primary/10 w-fit p-3 rounded-xl">
        <Mail className="w-8 h-8" />
      </div>
      <h3 className="text-2xl font-black mb-4 tracking-tight dark:text-white text-gray-900">Stay Connected</h3>
      <p className="text-slate-400 text-sm mb-6 leading-relaxed">
        Receive our weekly curation of stories, culture, and business news directly in your inbox.
      </p>
      <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
        <input
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all placeholder:text-slate-600"
          placeholder="your@email.com"
          type="email"
          required
        />
        <button className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95">
          Subscribe Now
        </button>
      </form>
      <p className="text-[10px] text-slate-500 mt-6 text-center">
        We respect your privacy. Unsubscribe at any time.
      </p>
    </div>
  );
};

export default MailNewsletter;
