'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import RadiusSetup from '@/components/volunteer/RadiusSetup';
import { createClient } from '@/lib/supabase/client';

type Step = 'form' | 'submitting' | 'setup-radius' | 'success';

export default function VolunteerPage() {
  const [step, setStep] = useState<Step>('form');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [postcodeOrTown, setPostcodeOrTown] = useState('');
  const [volunteerType, setVolunteerType] = useState('group');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!firstName || !email || !password || !postcodeOrTown) {
      setError('Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setStep('submitting');

    try {
      const res = await fetch('/api/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          email,
          password,
          phone: phone || undefined,
          postcode_or_town: postcodeOrTown,
          volunteer_type: volunteerType,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Signup failed');
      }

      const supabase = createClient();
      await supabase.auth.signInWithPassword({ email, password });

      setStep('setup-radius');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStep('form');
    }
  };

  return (
    <>
      <Header />
      <main className="flex-1 pt-16">
        <div className="max-w-md mx-auto px-4 py-8">
          {step === 'form' && (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-loam">Sign up to volunteer</h1>
                <p className="text-sm text-weathered mt-1">
                  Help clean up your local area. We&apos;ll connect you with picks nearby.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  id="firstName"
                  label="First name"
                  placeholder="Your first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />

                <Input
                  id="email"
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <Input
                  id="password"
                  label="Password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <Input
                  id="phone"
                  label="Phone (optional)"
                  type="tel"
                  placeholder="07xxx xxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />

                <Input
                  id="postcodeOrTown"
                  label="Postcode or town"
                  placeholder="e.g. OX1 or Witney"
                  value={postcodeOrTown}
                  onChange={(e) => setPostcodeOrTown(e.target.value)}
                  required
                />

                <Select
                  id="volunteerType"
                  label="How would you like to help?"
                  value={volunteerType}
                  onChange={(e) => setVolunteerType(e.target.value)}
                  options={[
                    { value: 'solo', label: 'Happy to help solo' },
                    { value: 'group', label: 'Happy to join a group' },
                    { value: 'organise', label: 'Happy to organise' },
                  ]}
                />

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</p>
                )}

                <Button type="submit" fullWidth size="lg">
                  Sign up
                </Button>
              </form>

              <p className="text-xs text-stone-300 text-center mt-4">
                Already have an account?{' '}
                <a href="/login" className="text-brand-500 hover:underline">Log in</a>
              </p>
            </>
          )}

          {step === 'submitting' && (
            <div className="text-center py-12">
              <svg className="animate-spin h-10 w-10 text-brand-500 mx-auto" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm text-weathered mt-4">Creating your account...</p>
            </div>
          )}

          {step === 'setup-radius' && (
            <RadiusSetup
              postcodeOrTown={postcodeOrTown}
              onComplete={() => setStep('success')}
            />
          )}

          {step === 'success' && (
            <Card className="text-center py-8">
              <h2 className="text-2xl font-bold text-loam">You&apos;re signed up.</h2>
              <p className="text-sm text-weathered mt-3 max-w-xs mx-auto leading-relaxed">
                We&apos;ll notify you when picks form near your area.
              </p>
              <div className="mt-6 space-y-3">
                <a href="/map" className="block">
                  <Button fullWidth>Explore the map</Button>
                </a>
                <a href="/profile" className="block">
                  <Button fullWidth variant="outline">View your profile</Button>
                </a>
              </div>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
