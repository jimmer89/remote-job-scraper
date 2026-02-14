'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
}

export default function UpgradeModal({ isOpen, onClose, feature = 'this feature' }: UpgradeModalProps) {
  const { data: session } = useSession();
  const router = useRouter();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    if (!session) {
      router.push('/auth/signin?callbackUrl=/pricing');
    } else {
      router.push('/pricing');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">💎</span>
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Unlock {feature}</h2>
          <p className="text-text-muted mb-6">
            Upgrade to ChillJobs Pro to access all features and find your perfect remote job faster.
          </p>

          {/* Features */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <p className="font-semibold mb-3">Pro includes:</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <span className="text-secondary">✓</span>
                <span><strong>Unlimited</strong> job access (not just 5)</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span className="text-secondary">✓</span>
                <span><strong>📵 No-Phone filter</strong> - Find call-free jobs</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span className="text-secondary">✓</span>
                <span><strong>💰 Salary filter</strong> - See pay upfront</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span className="text-secondary">✓</span>
                <span><strong>Email alerts</strong> - New jobs daily</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span className="text-secondary">✓</span>
                <span><strong>24h early access</strong> - Apply first</span>
              </li>
            </ul>
          </div>

          {/* Price */}
          <div className="mb-6">
            <span className="text-4xl font-bold">$9.99</span>
            <span className="text-text-muted">/month</span>
          </div>

          {/* CTA */}
          <button
            onClick={handleUpgrade}
            className="w-full py-3 bg-gradient-to-r from-primary to-pink-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            {session ? 'Upgrade to Pro' : 'Sign Up & Upgrade'}
          </button>
          
          <button
            onClick={onClose}
            className="w-full py-2 text-text-muted text-sm mt-2 hover:text-text transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
