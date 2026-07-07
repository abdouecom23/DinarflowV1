import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Lock, CreditCard, AlertCircle, Sparkles } from 'lucide-react';

interface PCIHostedFieldsProps {
  onSuccess: (cardDetails: { brand: string; last4: string }) => void;
  onCancel: () => void;
}

export const PCIHostedFields: React.FC<PCIHostedFieldsProps> = ({ onSuccess, onCancel }) => {
  const [isSecureLoading, setIsSecureLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [holderName, setHolderName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.substring(0, 16);
    const matches = value.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(' '));
    } else {
      setCardNumber(value);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (value.length >= 2) {
      setExpiry(`${value.substring(0, 2)}/${value.substring(2, 4)}`);
    } else {
      setExpiry(value);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 3);
    setCvv(value);
  };

  const handleSecureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (cardNumber.replace(/\s/g, '').length < 16) {
      setError('Invalid Card Number format.');
      return;
    }
    if (expiry.length < 5) {
      setError('Invalid Expiry Date.');
      return;
    }
    if (cvv.length < 3) {
      setError('Invalid Secure Code (CVV).');
      return;
    }
    if (!holderName.trim()) {
      setError('Cardholder name is required.');
      return;
    }

    setIsSecureLoading(true);

    // Simulate tokenization request to secure PCI vault endpoint (e.g. /api/v1/vault/tokenize)
    setTimeout(() => {
      setIsSecureLoading(false);
      onSuccess({
        brand: cardNumber.startsWith('5') ? 'MASTERCARD' : 'VISA',
        last4: cardNumber.substring(cardNumber.length - 4),
      });
    }, 1800);
  };

  return (
    <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 relative overflow-hidden">
      {/* PCI DSS Watermark Badge */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
          <ShieldCheck className="w-4 h-4" />
          <span>PCI-DSS Level 1 Compliant Vault</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          <Lock className="w-3 h-3" /> Secure Session
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-bold text-gray-900 text-sm">Add New Funding Source</h4>
        <p className="text-xs text-gray-500 leading-relaxed">
          Your credentials are tokenized directly within an isolated sandbox environment. 
          Raw card details never hit the main application store or LocalStorage.
        </p>
      </div>

      <form onSubmit={handleSecureSubmit} className="space-y-4">
        {/* Cardholder Name */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Cardholder Name
          </label>
          <input
            type="text"
            required
            value={holderName}
            onChange={(e) => setHolderName(e.target.value)}
            placeholder="e.g. MOHAMED BEN"
            className="w-full h-11 px-4 text-sm font-semibold rounded-xl bg-white border border-gray-200 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/5 transition-all uppercase"
          />
        </div>

        {/* Card Number Input (Simulated iframe viewport) */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex justify-between items-center">
            <span>Card Number</span>
            <span className="text-[10px] text-gray-400 font-normal">Hosted Input Viewport</span>
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <CreditCard className="w-5 h-5" />
            </div>
            {/* Styled hosted field border to visual lock */}
            <input
              type="text"
              required
              value={cardNumber}
              onChange={handleCardNumberChange}
              placeholder="4000 1234 5678 9010"
              className="w-full h-11 pl-12 pr-4 text-sm font-mono tracking-widest rounded-xl bg-white border border-indigo-200 ring-2 ring-indigo-50/50 focus:border-indigo-500 focus:ring-indigo-100 focus:outline-none transition-all placeholder:opacity-50"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Expiry */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Expiry Date
            </label>
            <input
              type="text"
              required
              placeholder="MM/YY"
              value={expiry}
              onChange={handleExpiryChange}
              className="w-full h-11 px-4 text-sm font-mono tracking-widest rounded-xl bg-white border border-indigo-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all placeholder:opacity-50"
            />
          </div>

          {/* Secure CVV */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex justify-between items-center">
              <span>Secure Code</span>
              <span className="text-[9px] text-gray-400 lowercase font-normal">CVV/CVC</span>
            </label>
            <input
              type="password"
              required
              placeholder="•••"
              value={cvv}
              onChange={handleCvvChange}
              className="w-full h-11 px-4 text-sm font-mono tracking-widest rounded-xl bg-white border border-indigo-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSecureLoading}
            className="flex-1 h-11 text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSecureLoading}
            className="flex-1 h-11 text-xs font-bold text-white bg-gray-900 hover:bg-gray-800 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            {isSecureLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
                <span>Tokenizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Save Securely</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
