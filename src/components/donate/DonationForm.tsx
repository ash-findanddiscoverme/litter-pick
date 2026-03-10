'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';

const PRESET_AMOUNTS = [5, 10, 25, 50];

const IMPACT_MESSAGES: Record<number, string> = {
  5: 'Covers bags and gloves for two picks.',
  10: 'Funds supplies for a local litter pick.',
  25: 'Helps map and monitor a new hotspot area.',
  50: 'Supports a full community pick event.',
};

export default function DonationForm() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(10);
  const [customAmount, setCustomAmount] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const activeAmount = customAmount ? Number(customAmount) : selectedAmount;

  const handlePresetClick = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
    setError('');
  };

  const handleCustomChange = (value: string) => {
    setCustomAmount(value);
    if (value) setSelectedAmount(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeAmount || activeAmount < 2) {
      setError('Please enter at least £2.');
      return;
    }
    if (activeAmount > 10000) {
      setError('Maximum donation is £10,000.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/donations/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: activeAmount,
          isRecurring,
          email: email || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch {
      setError('Could not connect to payment service. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const impactMessage =
    activeAmount && IMPACT_MESSAGES[activeAmount]
      ? IMPACT_MESSAGES[activeAmount]
      : activeAmount && activeAmount >= 2
        ? 'Every donation helps keep Oxfordshire clean.'
        : null;

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      {/* One-off / Monthly toggle */}
      <div className="flex rounded-xl bg-stone-100 p-1 mb-8">
        <button
          type="button"
          className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
            !isRecurring ? 'bg-white text-loam shadow-sm' : 'text-weathered'
          }`}
          onClick={() => setIsRecurring(false)}
        >
          One-off
        </button>
        <button
          type="button"
          className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
            isRecurring ? 'bg-white text-loam shadow-sm' : 'text-weathered'
          }`}
          onClick={() => setIsRecurring(true)}
        >
          Monthly
        </button>
      </div>

      {/* Preset amounts */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {PRESET_AMOUNTS.map((amount) => (
          <button
            key={amount}
            type="button"
            className={`py-3 rounded-xl text-base font-semibold transition-all border-2 ${
              selectedAmount === amount && !customAmount
                ? 'border-brand-500 bg-brand-50 text-brand-600'
                : 'border-stone-200 bg-white text-loam hover:border-stone-300'
            }`}
            onClick={() => handlePresetClick(amount)}
          >
            &pound;{amount}
          </button>
        ))}
      </div>

      {/* Custom amount */}
      <div className="relative mb-4">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-weathered font-medium">
          &pound;
        </span>
        <input
          type="number"
          min="2"
          max="10000"
          step="1"
          placeholder="Other amount"
          value={customAmount}
          onChange={(e) => handleCustomChange(e.target.value)}
          className="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-stone-200 text-loam placeholder:text-stone-300 focus:border-brand-500 focus:outline-none transition-colors"
        />
      </div>

      {/* Impact message */}
      {impactMessage && (
        <p className="text-sm text-brand-600 bg-brand-50 rounded-lg px-4 py-2.5 mb-6 text-center">
          {impactMessage}
        </p>
      )}

      {/* Email (optional) */}
      <input
        type="email"
        placeholder="Email for receipt (optional)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 text-loam placeholder:text-stone-300 focus:border-brand-500 focus:outline-none transition-colors mb-6"
      />

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2.5 mb-4 text-center">
          {error}
        </p>
      )}

      {/* Submit */}
      <Button
        size="lg"
        fullWidth
        disabled={isLoading || !activeAmount || activeAmount < 2}
      >
        {isLoading
          ? 'Redirecting to payment...'
          : `Donate £${activeAmount || 0}${isRecurring ? '/month' : ''}`}
      </Button>

      <p className="text-xs text-stone-400 text-center mt-4">
        Secure payment powered by Stripe. {isRecurring && 'Cancel any time from your Stripe dashboard.'}
      </p>
    </form>
  );
}
