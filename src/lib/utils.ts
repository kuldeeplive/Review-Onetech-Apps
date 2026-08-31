import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import QRCode from 'qrcode';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export async function generateQRCode(url: string, color = '#000000'): Promise<string> {
  try {
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: {
        dark: color,
        light: '#ffffff',
      },
    });
    return qrDataUrl;
  } catch (err) {
    console.error('Error generating QR Code:', err);
    return '';
  }
}

export const AI_REVIEW_PRESETS = [
  {
    id: 'food_service',
    label: 'Delicious & Fast',
    text: 'Amazing food quality and super fast service! The staff was courteous and the atmosphere was wonderful. Highly recommended to everyone.',
  },
  {
    id: 'hospitality',
    label: 'Great Hospitality',
    text: 'Top notch customer care and very welcoming staff! They made sure everything was perfect from start to finish. 5 stars!',
  },
  {
    id: 'value_money',
    label: 'Great Value',
    text: 'Excellent experience! Great quality, clean and hygienic ambience, and truly worth every penny. Will definitely visit again.',
  },
  {
    id: 'ambience',
    label: 'Clean & Premium',
    text: 'Loved the vibe and cleanliness of the place. Friendly team, prompt response, and outstanding attention to detail.',
  },
];
