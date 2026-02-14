'use client';

interface LockedJobCardProps {
  onClick: () => void;
}

export default function LockedJobCard({ onClick }: LockedJobCardProps) {
  return (
    <div 
      onClick={onClick}
      className="group relative bg-white rounded-xl border border-border p-5 cursor-pointer hover:border-primary/50 transition-all overflow-hidden"
    >
      {/* Blur overlay */}
      <div className="absolute inset-0 backdrop-blur-sm bg-white/60 z-10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-pink-500 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
            <span className="text-xl">🔒</span>
          </div>
          <p className="font-semibold text-text">Unlock with Pro</p>
          <p className="text-sm text-text-muted">$9.99/month</p>
        </div>
      </div>

      {/* Blurred content (fake) */}
      <div className="select-none">
        <div className="flex items-start gap-4 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gray-200"></div>
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-100 rounded w-1/2"></div>
          </div>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="h-3 bg-gray-100 rounded w-full"></div>
          <div className="h-3 bg-gray-100 rounded w-5/6"></div>
          <div className="h-3 bg-gray-100 rounded w-4/6"></div>
        </div>

        <div className="flex gap-2">
          <div className="h-6 bg-gray-100 rounded-full w-20"></div>
          <div className="h-6 bg-gray-100 rounded-full w-16"></div>
          <div className="h-6 bg-gray-100 rounded-full w-24"></div>
        </div>
      </div>
    </div>
  );
}
