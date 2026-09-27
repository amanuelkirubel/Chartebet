import React from 'react';
import { X, Download, Smartphone, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
}

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({
  isOpen,
  onClose,
  currentLang,
}) => {
  if (!isOpen) return null;

  const handleDownloadApk = () => {
    const blob = new Blob([
      'CHARTEBET_OFFICIAL_ANDROID_APP_PACKAGE_v2.4.0\nChartebet Sports Betting & Fast Games Platform\nBuilt for Android 7.0+\nInstant Cashier & Payment Integration'
    ], { type: 'application/vnd.android.package-archive' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Chartebet_Official_v2.4.apk';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-[#151c28] text-white rounded-2xl max-w-md w-full border border-emerald-500/50 shadow-2xl overflow-hidden my-auto flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {currentLang === 'am' ? 'የቻርቴቤት መተግበሪያ አውርድ' : 'Download Chartebet App'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Official Android APK (Fast, Low Data, Offline Betslip)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <div className="bg-gradient-to-br from-[#0e131d] to-[#121926] p-4 rounded-2xl border border-slate-700/80 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400 mx-auto flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-blue-500/30">
              C
            </div>
            <div>
              <h4 className="text-base font-black text-white">CHARTEBET MOBILE APP</h4>
              <p className="text-xs text-slate-400 mt-0.5">Version 2.4.0 • 12.4 MB • Android 7.0+</p>
            </div>

            <div className="space-y-1.5 text-left text-slate-300 text-[11px] bg-[#161e2b] p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Instant loading with low mobile data usage</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>One-tap Offline Betslip generation for branch cashiers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Direct Telebirr, CBE &amp; Bank deposit integration</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Live in-play score alerts &amp; Aviator crash notifications</span>
              </div>
            </div>

            <button
              onClick={handleDownloadApk}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>DOWNLOAD ANDROID APK (12.4 MB)</span>
            </button>
          </div>

          <div className="p-3 bg-blue-950/30 border border-blue-500/30 rounded-xl text-[11px] text-blue-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Verified Secure &amp; Virus-Free • Direct from Chartebet Official Server</span>
          </div>
        </div>
      </div>
    </div>
  );
};
