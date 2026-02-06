import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(text: string): string {
  return text
    .toString()
    .normalize('NFD')                   // Decompose combined characters into their base characters and diacritics
    .replace(/[\u0300-\u036f]/g, '')     // Remove diacritics
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')                // Replace spaces with -
    .replace(/[^\w\-]+/g, '')            // Remove all non-word chars
    .replace(/\-\-+/g, '-')              // Replace multiple - with single -
    .replace(/^-+/, '')                  // Trim - from start of text
    .replace(/-+$/, '');                 // Trim - from end of text
}

export function getEmbedUrl(url: string): string {
  if (!url) return '';

  try {
    // Handle YouTube
    if (url.match(/youtu\.?be/)) {
      const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/|live\/|v\/))([\w-]{11})/);
      const videoId = videoIdMatch ? videoIdMatch[1] : null;
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    // Handle Instagram (basic, heavily restricted by cross-origin, but we can try /embed)
    if (url.includes('instagram.com')) {
      // Instagram embeds are trickier without API, passing raw might work if it's already an embed link, 
      // otherwise requires <blockquote class="instagram-media">...
      // For now, we return as is or if user provided "/embed" it works. 
      // A common hack is adding /embed at the end if not present, but it often redirects to login.
      // Let's stick to fixing YouTube first which is the specific error reported.
      return url;
    }

    return url;
  } catch (e) {
    return url;
  }
}
