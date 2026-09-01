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

/**
 * Calculates the start date of the current billing cycle for a business based on the date they joined / subscribed.
 * For example: If created on 15th Aug, on 10th Sept the cycle start is 15th Aug. On 16th Sept the cycle start is 15th Sept.
 */
export function getBillingCycleStart(anchorDate?: Date | string | null): Date {
  const now = new Date();
  if (!anchorDate) {
    return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  }

  const anchor = new Date(anchorDate);
  const anchorDay = anchor.getDate();

  let cycleYear = now.getFullYear();
  let cycleMonth = now.getMonth();

  // If today's date is before the monthly anchor day, the current cycle started in the previous month
  if (now.getDate() < anchorDay) {
    cycleMonth -= 1;
    if (cycleMonth < 0) {
      cycleMonth = 11;
      cycleYear -= 1;
    }
  }

  // Handle months with fewer days (e.g. Feb 28/29, April 30)
  const daysInCycleMonth = new Date(cycleYear, cycleMonth + 1, 0).getDate();
  const actualDay = Math.min(anchorDay, daysInCycleMonth);

  return new Date(cycleYear, cycleMonth, actualDay, 0, 0, 0, 0);
}

/**
 * Calculates the next reset date for the billing cycle.
 */
export function getNextBillingResetDate(anchorDate?: Date | string | null): Date {
  const cycleStart = getBillingCycleStart(anchorDate);
  const anchor = anchorDate ? new Date(anchorDate) : new Date();
  const anchorDay = anchor.getDate();

  let nextYear = cycleStart.getFullYear();
  let nextMonth = cycleStart.getMonth() + 1;
  if (nextMonth > 11) {
    nextMonth = 0;
    nextYear += 1;
  }

  const daysInNextMonth = new Date(nextYear, nextMonth + 1, 0).getDate();
  const actualDay = Math.min(anchorDay, daysInNextMonth);

  return new Date(nextYear, nextMonth, actualDay, 0, 0, 0, 0);
}
