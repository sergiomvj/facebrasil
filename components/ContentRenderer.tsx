import React from 'react';
import AdSpace from '@/components/AdSpace';

interface ContentRendererProps {
    content: string;
}

const ContentRenderer: React.FC<ContentRendererProps> = ({ content }) => {
    // Simple splitter: split by closing paragraph tag
    // Note: This is a naive approach. For production, use a proper HTML parser (like html-react-parser).
    // This assumes the content from FBR-Blogger is relatively clean HTML.
    // Improved splitter: detect if we have HTML tags or plain text
    const hasTags = content.includes('<p>') || content.includes('<div');
    const sections = hasTags ? content.split('</p>') : content.split('\n\n');

    return (
        <div className="prose dark:prose-invert prose-lg max-w-none dark:text-slate-300 text-slate-800 leading-relaxed mb-16">
            {sections.map((chunk, index) => {
                const trimmed = chunk.trim();
                if (!trimmed) return null; // Skip empty chunks

                const isLast = index === sections.length - 1;
                // Inject Ad after every 3rd paragraph for better flow, but not at the very end
                const shouldInjectAd = (index + 1) % 3 === 0 && !isLast;

                // Re-wrap in P if it was plain text or split
                const htmlContent = hasTags ? (trimmed.endsWith('</p>') ? trimmed : (trimmed + '</p>')) : `<p>${trimmed.replace(/\n/g, '<br/>')}</p>`;

                return (
                    <React.Fragment key={index}>
                        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                        {shouldInjectAd && (
                            <AdSpace position="inline" />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default ContentRenderer;
