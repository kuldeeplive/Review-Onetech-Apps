import React from 'react';

export default function Footer({ className = '' }: { className?: string }) {
  return (
    <footer className={`py-6 text-center text-xs text-slate-500 font-medium ${className}`}>
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2">
        <span>© {new Date().getFullYear()} AI Magic Review.</span>
        <span className="hidden sm:inline">•</span>
        <span>
          Developed by{' '}
          <a
            href="https://onetechsolution.in"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-slate-800 hover:text-blue-600 underline underline-offset-4 decoration-slate-300 hover:decoration-blue-600 transition"
          >
            Onetech Solution
          </a>
        </span>
      </div>
    </footer>
  );
}
