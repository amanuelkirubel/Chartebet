import React, { useState } from 'react';
import { X, PhoneCall, CheckCircle2, Clock, Send, MessageSquare } from 'lucide-react';
import { Language } from '../types';
import { recordCallBackRequest } from '../utils/betAndTransactionStore';

interface RequestCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
}

export const RequestCallModal: React.FC<RequestCallModalProps> = ({
  isOpen,
  onClose,
  currentLang,
}) => {
  const [name, setName] = useState('');
  const [contactPreference, setContactPreference] = useState<'Phone Call' | 'Telegram' | 'WhatsApp'>('Phone Call');
  const [contactValue, setContactValue] = useState('');
  const [preferredTime, setPreferredTime] = useState('ASAP (5 to 15 minutes)');
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contactValue.trim()) return;

    // Requirement 6: Routes directly to Chartekirubel77@gmail.com and records into local storage
    recordCallBackRequest({
      name: name.trim(),
      contactPreference,
      contactValue: contactValue.trim(),
      preferredTime,
      notes: notes.trim() || undefined,
    });

    setIsSubmitted(true);
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setName('');
    setContactValue('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-[#151c28] text-white rounded-2xl max-w-md w-full border border-slate-700/80 shadow-2xl overflow-hidden my-auto flex flex-col">
        {/* Header - Official Chartebet VIP Support Desk while email remains completely private */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {currentLang === 'am' ? 'ደውሉልኝ (VIP Call Back)' : 'Chartebet VIP Support Desk'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Direct Priority Response • Dedicated VIP Support
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
          {isSubmitted ? (
            <div className="p-4 bg-emerald-950/80 border border-emerald-500 rounded-xl space-y-2 text-center text-emerald-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h4 className="font-bold text-sm text-white">
                {currentLang === 'am' ? 'የጥሪ ጥያቄዎ ደርሶናል!' : 'Callback Request Dispatched!'}
              </h4>
              <p className="text-xs text-slate-300">
                {currentLang === 'am'
                  ? `የቻርቴቤት ቪአይፒ የደንበኞች ድጋፍ ባለሙያ በ${contactPreference} ወደ ${contactValue} በአጭር ጊዜ ውስጥ ያነጋግርዎታል።`
                  : `Your request has been routed to the Chartebet VIP Support Desk. Our dedicated agent will reach out via ${contactPreference} to ${contactValue} promptly.`}
              </p>
              <button
                onClick={handleResetAndClose}
                className="mt-3 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  {currentLang === 'am' ? 'ሙሉ ስምዎ' : 'Your Full Name'}:
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dawit Bekele"
                  className="w-full bg-[#0e131d] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Contact Preference Selection (Phone Call, Telegram, WhatsApp) */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
                  {currentLang === 'am' ? 'እንዴት እንድናነጋግርዎ ይፈልጋሉ?' : 'Contact Preference'}:
                </label>
                <div className="grid grid-cols-3 gap-1.5 bg-[#0e131d] p-1 rounded-xl border border-slate-800 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setContactPreference('Phone Call')}
                    className={`py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                      contactPreference === 'Phone Call'
                        ? 'bg-emerald-600 text-slate-950 font-black shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Phone Call</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setContactPreference('Telegram')}
                    className={`py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                      contactPreference === 'Telegram'
                        ? 'bg-sky-500 text-slate-950 font-black shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Telegram</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setContactPreference('WhatsApp')}
                    className={`py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                      contactPreference === 'WhatsApp'
                        ? 'bg-green-500 text-slate-950 font-black shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* Contact Handle / Phone Number */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  {contactPreference === 'Telegram'
                    ? currentLang === 'am' ? 'የቴሌግራም አድራሻ (@username ወይም ስልክ)' : 'Telegram Handle or Phone (@username)'
                    : contactPreference === 'WhatsApp'
                      ? currentLang === 'am' ? 'የዋትስአፕ ስልክ ቁጥር' : 'WhatsApp Mobile Number'
                      : currentLang === 'am' ? 'ስልክ ቁጥርዎ' : 'Phone Number To Call'}:
                </label>
                <input
                  type="text"
                  required
                  value={contactValue}
                  onChange={(e) => setContactValue(e.target.value)}
                  placeholder={
                    contactPreference === 'Telegram'
                      ? '@username or 09...'
                      : '09... or 07...'
                  }
                  className="w-full bg-[#0e131d] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Preferred Time */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  {currentLang === 'am' ? 'የሚመርጡት የመደወያ ሰዓት' : 'Preferred Callback Time'}:
                </label>
                <select
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full bg-[#0e131d] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="ASAP (5 to 15 minutes)">ASAP (Fastest: 5 to 15 minutes)</option>
                  <option value="Morning (9:00 AM - 12:00 PM)">Morning (9:00 AM - 12:00 PM)</option>
                  <option value="Afternoon (1:00 PM - 5:00 PM)">Afternoon (1:00 PM - 5:00 PM)</option>
                  <option value="Evening (6:00 PM - 10:00 PM)">Evening (6:00 PM - 10:00 PM)</option>
                </select>
              </div>

              {/* Notes / Reason */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  {currentLang === 'am' ? 'ማስታወሻ / የጥያቄዎ ዝርዝር' : 'Notes / Topic of Inquiry (Optional)'}:
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Deposit confirmation, ticket payout, or cashier assistance..."
                  className="w-full bg-[#0e131d] border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="p-2.5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-[11px] text-emerald-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Chartebet VIP Support Desk operates 24/7 with zero waiting queues.
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black rounded-xl text-xs sm:text-sm transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" />
                <span>
                  {currentLang === 'am' ? 'ጥሪ ጠይቅ (Submit VIP Callback)' : 'Dispatch VIP Callback Request'}
                </span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
