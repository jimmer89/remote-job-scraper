'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import confetti from 'canvas-confetti';

export default function SuccessPage() {
  const { update } = useSession();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Fire confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Update session to reflect Pro status
    update({ isPro: true });

    // Countdown redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = '/';
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [update]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-primary to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl">🎉</span>
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Welcome to Pro!</h1>
        <p className="text-text-secondary mb-8">
          You now have full access to all ChillJobs features. Let's find your dream remote job!
        </p>

        <div className="bg-white rounded-xl border border-border p-6 mb-8 text-left">
          <p className="font-semibold mb-3">What you unlocked:</p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-sm">
              <span className="text-secondary">✓</span>
              <span>Unlimited job access</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <span className="text-secondary">✓</span>
              <span>📵 No-Phone filter</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <span className="text-secondary">✓</span>
              <span>💰 Salary filter</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <span className="text-secondary">✓</span>
              <span>Email alerts for new jobs</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <span className="text-secondary">✓</span>
              <span>24h early access to new jobs</span>
            </li>
          </ul>
        </div>

        <a
          href="/"
          className="inline-block px-8 py-3 bg-gradient-to-r from-primary to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
        >
          Start Browsing Jobs
        </a>

        <p className="text-text-muted text-sm mt-4">
          Redirecting in {countdown}s...
        </p>
      </div>
    </div>
  );
}
