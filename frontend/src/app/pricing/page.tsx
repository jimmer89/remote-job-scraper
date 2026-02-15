'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async () => {
    if (!session) {
      router.push('/auth/signin?callbackUrl=/pricing');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.user?.email }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-white">
      {/* Header */}
      <header className="border-b border-border bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <a href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="ChillJobs" className="w-10 h-10" />
            <span className="text-xl font-bold gradient-text">ChillJobs</span>
          </a>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Find Your Dream Job <span className="gradient-text">Faster</span>
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Unlock all features and get unlimited access to no-phone remote jobs
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free tier */}
          <div className="bg-white rounded-2xl border border-border p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Free</h2>
              <p className="text-text-muted">Get started with basic features</p>
            </div>
            
            <div className="mb-8">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-text-muted">/forever</span>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3">
                <span className="text-green-500">✓</span>
                <span>1 job preview per search</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-500">✓</span>
                <span>Basic search & categories</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-500">✓</span>
                <span>Job matching quiz</span>
              </li>
              <li className="flex items-center gap-3 text-text-muted">
                <span>✕</span>
                <span>No-Phone filter</span>
              </li>
              <li className="flex items-center gap-3 text-text-muted">
                <span>✕</span>
                <span>Salary filter</span>
              </li>
              <li className="flex items-center gap-3 text-text-muted">
                <span>✕</span>
                <span>Email alerts</span>
              </li>
            </ul>

            <a
              href="/"
              className="block w-full py-3 text-center border-2 border-border rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Continue with Free
            </a>
          </div>

          {/* Pro tier */}
          <div className="bg-gradient-to-br from-primary to-pink-500 rounded-2xl p-8 text-white relative overflow-hidden">
            {/* Popular badge */}
            <div className="absolute top-4 right-4 px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
              Most Popular
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Pro</h2>
              <p className="text-white/80">Everything you need to land your dream job</p>
            </div>
            
            <div className="mb-8">
              <span className="text-4xl font-bold">$9.99</span>
              <span className="text-white/80">/month</span>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3">
                <span className="text-green-300">✓</span>
                <span><strong>Unlimited</strong> job access</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-300">✓</span>
                <span><strong>📵 No-Phone filter</strong> - The magic sauce</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-300">✓</span>
                <span><strong>💰 Salary filter</strong> - Know before you apply</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-300">✓</span>
                <span><strong>Email alerts</strong> - Never miss a job</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-300">✓</span>
                <span><strong>24h early access</strong> - Apply first</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-300">✓</span>
                <span><strong>Save favorites</strong> - Build your list</span>
              </li>
            </ul>

            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-300/30 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full py-3 bg-white text-primary rounded-xl font-semibold hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : session ? 'Upgrade Now' : 'Sign Up & Upgrade'}
            </button>

            <p className="text-center text-sm text-white/60 mt-4">
              Cancel anytime • No questions asked
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <details className="bg-white rounded-xl border border-border p-4 group">
              <summary className="font-medium cursor-pointer list-none flex justify-between items-center">
                What makes the No-Phone filter special?
                <span className="text-primary group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-text-secondary">
                We're the only job board that specifically filters for jobs that don't require phone calls. 
                Perfect for introverts, people with phone anxiety, or anyone who prefers async communication.
                We analyze job descriptions to detect chat-only, email-only, and text-based positions.
              </p>
            </details>

            <details className="bg-white rounded-xl border border-border p-4 group">
              <summary className="font-medium cursor-pointer list-none flex justify-between items-center">
                Can I cancel anytime?
                <span className="text-primary group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-text-secondary">
                Yes! You can cancel your subscription at any time with no questions asked. 
                You'll keep Pro access until the end of your billing period.
              </p>
            </details>

            <details className="bg-white rounded-xl border border-border p-4 group">
              <summary className="font-medium cursor-pointer list-none flex justify-between items-center">
                How often are jobs updated?
                <span className="text-primary group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-text-secondary">
                We scrape new jobs every 6 hours from 5+ trusted sources including RemoteOK, 
                WeWorkRemotely, Reddit, Indeed, and Glassdoor. Pro users see new jobs 24 hours 
                before free users.
              </p>
            </details>

            <details className="bg-white rounded-xl border border-border p-4 group">
              <summary className="font-medium cursor-pointer list-none flex justify-between items-center">
                What payment methods do you accept?
                <span className="text-primary group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-text-secondary">
                We accept all major credit cards, debit cards, and Apple Pay through our secure 
                payment partner Stripe. Your payment information is never stored on our servers.
              </p>
            </details>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <p className="text-text-secondary mb-4">
            Join hundreds of introverts who found their dream remote job
          </p>
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-primary to-pink-500 text-white font-semibold rounded-2xl hover:opacity-90 transition-opacity"
          >
            {loading ? 'Loading...' : 'Get Pro Access Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
