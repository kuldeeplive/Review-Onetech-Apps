'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  QrCode,
  Download,
  Printer,
  Copy,
  Check,
  Star,
  Sparkles,
  RefreshCw,
  Type,
  CheckCircle2,
  ImageIcon,
} from 'lucide-react';
import QRCode from 'qrcode';

export default function QRBuilderPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingCard, setDownloadingCard] = useState(false);
  
  // Customization states
  const [businessName, setBusinessName] = useState('');
  const [fontSize, setFontSize] = useState(24);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');

  const previewCardRef = useRef<HTMLDivElement>(null);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();

      if (!meData.authenticated) {
        router.push('/login');
        return;
      }
      setUser(meData.user);
      if (meData.user.business?.name) {
        setBusinessName(meData.user.business.name);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientData();
  }, []);

  const publicUrl =
    typeof window !== 'undefined' && user?.business?.slug
      ? `${window.location.origin}/review/${user.business.slug}`
      : '';

  useEffect(() => {
    if (publicUrl) {
      QRCode.toDataURL(publicUrl, {
        width: 1000,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      }).then((url) => setQrDataUrl(url));
    }
  }, [publicUrl]);

  // High-Resolution Direct Canvas Render & PNG Export (100% Pixel-Perfect)
  const handleDownloadFullCard = async () => {
    if (!qrDataUrl) return;
    setDownloadingCard(true);

    try {
      // 1. Create off-screen canvas at native 2x HD resolution
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      // Native template dimensions (scaled 2x for ultra 300DPI crisp print quality)
      const scale = 2;
      const baseWidth = 683;
      const baseHeight = 1024;
      canvas.width = baseWidth * scale;
      canvas.height = baseHeight * scale;

      // 2. Load background template image
      const bgImg = new Image();
      bgImg.crossOrigin = 'anonymous';
      bgImg.src = '/standees/google_standee_template.png';

      await new Promise((resolve, reject) => {
        bgImg.onload = resolve;
        bgImg.onerror = reject;
      });

      // Draw background
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

      // 3. Load and draw QR code inside the blue frame
      const qrImg = new Image();
      qrImg.src = qrDataUrl;
      await new Promise((resolve, reject) => {
        qrImg.onload = resolve;
        qrImg.onerror = reject;
      });

      // QR Code exact placement calibrated to the blue frame on template:
      // In base 683x1024 coordinates:
      // X = 181, Y = 437, Width = 321, Height = 321
      const qrX = 181 * scale;
      const qrY = 437 * scale;
      const qrSize = 321 * scale;
      
      // Draw smooth rounded white background behind QR
      const radius = 24 * scale;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(qrX + radius, qrY);
      ctx.lineTo(qrX + qrSize - radius, qrY);
      ctx.quadraticCurveTo(qrX + qrSize, qrY, qrX + qrSize, qrY + radius);
      ctx.lineTo(qrX + qrSize, qrY + qrSize - radius);
      ctx.quadraticCurveTo(qrX + qrSize, qrY + qrSize, qrX + qrSize - radius, qrY + qrSize);
      ctx.lineTo(qrX + radius, qrY + qrSize);
      ctx.quadraticCurveTo(qrX, qrY + qrSize, qrX, qrY + qrSize - radius);
      ctx.lineTo(qrX, qrY + radius);
      ctx.quadraticCurveTo(qrX, qrY, qrX + radius, qrY);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
      ctx.restore();

      // 4. Draw Business Name below stars
      const nameToDraw = (businessName || user?.business?.name || 'BUSINESS NAME').toUpperCase();
      ctx.save();
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Dynamic font size calculation based on name length
      let calculatedFontSize = fontSize * scale;
      if (nameToDraw.length > 25) {
        calculatedFontSize = Math.max(16 * scale, calculatedFontSize * 0.75);
      } else if (nameToDraw.length > 18) {
        calculatedFontSize = Math.max(18 * scale, calculatedFontSize * 0.85);
      }

      ctx.font = `900 ${calculatedFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;
      
      const textX = (baseWidth / 2) * scale;
      const textY = 200 * scale; // Exactly centered between stars and Review us on Google

      // Handle multiline if very long
      const maxWidth = 520 * scale;
      const words = nameToDraw.split(' ');
      let line = '';
      const lines = [];

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          lines.push(line.trim());
          line = words[n] + ' ';
        } else {
          line = testLine;
        }
      }
      lines.push(line.trim());

      if (lines.length === 1) {
        ctx.fillText(lines[0], textX, textY);
      } else {
        const lineHeight = calculatedFontSize * 1.15;
        const startY = textY - ((lines.length - 1) * lineHeight) / 2;
        for (let i = 0; i < lines.length; i++) {
          ctx.fillText(lines[i], textX, startY + i * lineHeight);
        }
      }
      ctx.restore();

      // 5. Trigger download
      const finalImage = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `${user?.business?.slug || 'business'}-google-review-standee.png`;
      link.href = finalImage;
      link.click();
    } catch (error) {
      console.error('Error generating standee image:', error);
      alert('Could not export image. Please try again.');
    } finally {
      setDownloadingCard(false);
    }
  };

  // Download raw QR code only
  const handleDownloadQROnly = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `${user?.business?.slug || 'business'}-qr-code.png`;
    a.click();
  };

  const handleCopyUrl = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSavePreferences = async () => {
    try {
      await fetch('/api/business/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: businessName,
        }),
      });
      setSaveSuccess('Business Name updated successfully!');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600 text-sm">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-blue-600" /> Loading Standee Studio...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 no-print">
        {/* Toast Alert */}
        {saveSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2 shadow-sm animate-bounce-short">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{saveSuccess}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="pb-6 border-b border-slate-200 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <QrCode className="w-6 h-6 text-blue-600" />
              Acrylic Table Standee & QR Studio
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Custom-designed high-resolution Google Review standee for acrylic table tent cards.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition"
            >
              <Printer className="w-4 h-4 text-blue-400" />
              Print (A5/A6)
            </button>
            <button
              onClick={handleDownloadFullCard}
              disabled={downloadingCard}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition disabled:opacity-50"
            >
              <ImageIcon className="w-4 h-4" />
              {downloadingCard ? 'Generating High-Res PNG...' : 'Download Full Standee (PNG)'}
            </button>
            <button
              onClick={handleDownloadQROnly}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition"
            >
              <Download className="w-3.5 h-3.5" />
              QR Only
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column (Left) */}
          <div className="lg:col-span-5 space-y-6">
            {/* 1. Text & Font Customizer */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Type className="w-4 h-4 text-indigo-600" />
                1. Standee Details
              </label>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Business Name (Placed below Stars)
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. SHARMA SWEETS & RESTAURANT"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase font-bold"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-600">
                      Font Size
                    </label>
                    <span className="text-xs font-bold text-blue-600">{fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min={16}
                    max={32}
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSavePreferences}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Save Business Name
              </button>
            </div>

            {/* 2. Direct Link */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Direct Scan URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={publicUrl}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 focus:outline-none"
                />
                <button
                  onClick={handleCopyUrl}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition shrink-0"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 3. Export Summary */}
            <div className="bg-blue-50/70 p-5 rounded-2xl border border-blue-200/80 text-xs space-y-2 text-blue-950">
              <p className="font-extrabold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                High-Res 300 DPI Export Ready
              </p>
              <p className="text-blue-800 text-[11px] leading-relaxed">
                Clicking <strong>"Download Full Standee (PNG)"</strong> uses the high-definition template with your dynamic QR code and business name merged into a single print-ready graphic.
              </p>
            </div>
          </div>

          {/* Standee Live Preview Column (Right) */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="bg-slate-900/10 p-4 sm:p-8 rounded-3xl flex flex-col items-center justify-center border border-slate-200/80 shadow-inner w-full">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Live Standee Preview (A5 / A6 Format)
              </p>

              {/* ======================================================== */}
              {/* EXACT STANDEE CARD USING UPLOADED TEMPLATE */}
              {/* ======================================================== */}
              <div
                ref={previewCardRef}
                className="w-full max-w-[340px] aspect-[683/1024] relative shadow-2xl rounded-[32px] overflow-hidden select-none bg-white border-[3px] border-slate-300"
                style={{
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2)',
                }}
              >
                {/* Base Template Graphic */}
                <img
                  src="/standees/google_standee_template.png"
                  alt="Standee Template"
                  className="w-full h-full object-cover pointer-events-none"
                />

                {/* 1. DYNAMIC BUSINESS NAME OVERLAY (Placed below stars) */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 text-center w-[80%] flex items-center justify-center pointer-events-none"
                  style={{
                    top: '17.8%',
                    height: '5.5%',
                  }}
                >
                  <h2
                    className="font-black text-slate-900 uppercase font-sans tracking-tight text-center leading-snug line-clamp-2 px-1"
                    style={{
                      fontSize: `${fontSize * 0.65}px`,
                    }}
                  >
                    {businessName || user.business?.name || 'SHOP / BUSINESS NAME'}
                  </h2>
                </div>

                {/* 2. DYNAMIC QR CODE OVERLAY (Placed inside blue rounded frame) */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none"
                  style={{
                    top: '42.8%',
                    width: '47%',
                    height: '31.4%',
                  }}
                >
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Review QR Code"
                      className="w-full h-full object-contain rounded-2xl"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-xs text-slate-400 rounded-xl">
                      Generating QR...
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons Below Preview */}
              <div className="mt-6 flex flex-wrap gap-3 justify-center">
                <button
                  onClick={handleDownloadFullCard}
                  disabled={downloadingCard}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {downloadingCard ? 'Exporting 300DPI PNG...' : 'Download Full Standee (PNG)'}
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs rounded-xl border border-slate-300 shadow-sm transition flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4 text-blue-600" />
                  Print A5/A6 Sheet
                </button>
              </div>
            </div>
          </div>
        </div>

        <Footer className="pt-8" />
      </main>

      {/* ======================================================== */}
      {/* PRINT-ONLY VIEW (Automatically formatted for standard A5/A6 paper) */}
      {/* ======================================================== */}
      <div className="printable-standee hidden print:block text-center p-0 bg-white max-w-sm mx-auto">
        <div className="w-full aspect-[683/1024] relative bg-white">
          <img
            src="/standees/google_standee_template.png"
            alt="Standee Print Template"
            className="w-full h-full object-cover"
          />
          <div
            className="absolute left-1/2 -translate-x-1/2 text-center w-[80%] flex items-center justify-center"
            style={{
              top: '17.8%',
              height: '5.5%',
            }}
          >
            <h2 className="font-black text-slate-900 uppercase font-sans tracking-tight text-center text-sm leading-snug">
              {businessName || user.business?.name}
            </h2>
          </div>

          <div
            className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center"
            style={{
              top: '42.8%',
              width: '47%',
              height: '31.4%',
            }}
          >
            {qrDataUrl && (
              <img
                src={qrDataUrl}
                alt="Review QR Code"
                className="w-full h-full object-contain rounded-2xl"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
