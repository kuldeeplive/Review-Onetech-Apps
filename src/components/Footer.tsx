import React from 'react';

interface FooterProps {
  className?: string;
  brandName?: string;
  footerText?: string;
  footerUrl?: string;
}

export default function Footer({
  className = '',
  brandName = 'AI Magic Review',
  footerText = 'Developed by Onetech Solution',
  footerUrl = 'https://onetechsolution.in',
}: FooterProps) {
  return (
    <footer className={`py-6 text-center text-xs text-slate-500 font-medium ${className}`}>
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2">
        <span>© {new Date().getFullYear()} {brandName}.</span>
        <span className="hidden sm:inline">•</span>
        <span>
          <a
            href={footerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-slate-800 hover:text-blue-600 underline underline-offset-4 decoration-slate-300 hover:decoration-blue-600 transition"
          >
            {footerText}
          </a>
        </span>
      </div>
    </footer>
  );
}
