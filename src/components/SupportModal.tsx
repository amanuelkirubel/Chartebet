import React, { useState } from 'react';
import { 
  X, 
  PhoneCall, 
  Send, 
  CheckCircle2, 
  ExternalLink
} from 'lucide-react';
import { recordCallBackRequest } from '../utils/betAndTransactionStore';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketContact, setTicketContact] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSendTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketMessage.trim() || !ticketContact.trim()) return;

    recordCallBackRequest({
      name: ticketSubject || 'Support Ticket',
      contactPreference: 'Phone Call',
      contactValue: ticketContact.trim(),
      preferredTime: 'ASAP',
      notes: ticketMessage.trim(),
    });

    setTicketSubmitted(true);
    setTimeout(() => {
      setTicketSubmitted(false);
      setTicketSubject('');
      setTicketMessage('');
      setTicketContact('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-slate-900 text-white rounded-2xl max-w-lg w-full border border-slate-700 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 flex items-center justify-between border-b border-blue-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <PhoneCall className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-white">CHARTEBET VIP SUPPORT DESK</h2>
              <p className="text-xs text-blue-300">Fast Response • 24/7 VIP Customer Care</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Official Channels */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Direct Contact Channels
            </h4>

            {/* Requirement 3: Updated to @Chartebetting7 */}
            <a
              href="https://t.me/Chartebetting7"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3.5 bg-sky-950/40 hover:bg-sky-900/40 border border-sky-500/40 rounded-xl transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-sky-500 text-slate-950 flex items-center justify-center font-bold">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm flex items-center gap-1.5">
                    <span>Telegram VIP Support</span>
                    <span className="text-[10px] bg-sky-600 text-white px-1.5 py-0.2 rounded font-mono">FASTEST</span>
                  </div>
                  <div className="text-xs text-sky-300 font-semibold">@Chartebetting7</div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-sky-400 group-hover:translate-x-0.5 transition" />
            </a>

            <div className="flex items-center justify-between p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">Customer Hotline</div>
                  <div className="text-xs font-mono font-medium text-slate-300">+251 911 234 567 / +251 977 889 900</div>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-bold">
                Toll-Free
              </span>
            </div>
          </div>

          {/* Quick Ticket Form */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Send Priority Inquiry
            </h4>

            {ticketSubmitted ? (
              <div className="p-4 bg-emerald-950/80 border border-emerald-500 rounded-xl text-center space-y-2 text-emerald-200">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h5 className="font-bold text-sm text-white">Inquiry Transmitted to Support Desk!</h5>
                <p className="text-xs text-slate-300">An authorized support specialist will respond shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSendTicket} className="space-y-3">
                <div>
                  <label className="text-slate-300 block mb-1">Your Mobile Phone or Telegram:</label>
                  <input
                    type="text"
                    required
                    value={ticketContact}
                    onChange={(e) => setTicketContact(e.target.value)}
                    placeholder="09... or @username"
                    className="w-full bg-[#0e131d] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Topic / Subject:</label>
                  <input
                    type="text"
                    required
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="e.g. Deposit confirmation / Ticket verification / Cashier help"
                    className="w-full bg-[#0e131d] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Message Details:</label>
                  <textarea
                    required
                    rows={3}
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Describe your question or provide booking code..."
                    className="w-full bg-[#0e131d] border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Transmit Priority Inquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
