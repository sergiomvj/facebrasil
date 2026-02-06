"use client";

import React, { useState } from 'react';

interface AIAssistantProps {
    articleContent: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ articleContent }) => {
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState<string | null>(null);

    const handleSummarize = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/ai/summarize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: articleContent }),
            });
            const data = await response.json();
            if (data.summary) {
                setSummary(data.summary);
            }
        } catch (error) {
            console.error("Failed to summarize:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card p-4 rounded-xl mb-10 border-primary/20 bg-primary/5 transition-all duration-500">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-primary/20 text-primary ${loading ? 'animate-pulse' : ''}`}>
                        <span className="material-symbols-outlined text-xl">auto_awesome</span>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white">AI Assistant</p>
                        <p className="text-xs text-slate-400">Generate insights or summaries</p>
                    </div>
                </div>

                {!summary && (
                    <button
                        onClick={handleSummarize}
                        disabled={loading}
                        className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                                Processing...
                            </>
                        ) : (
                            'Summarize'
                        )}
                    </button>
                )}
            </div>

            {/* Summary Result */}
            {summary && (
                <div className="mt-4 pt-4 border-t border-white/10 animate-in fade-in slide-in-from-top-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Key Takeaways</h4>
                    <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                        {summary}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIAssistant;
