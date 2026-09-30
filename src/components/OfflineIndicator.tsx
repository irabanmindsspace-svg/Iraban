import React, { useEffect, useState } from 'react';
import { WifiOff, Radio } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded bg-amber-800 px-3.5 py-2.5 text-xs font-medium text-white shadow-lg border border-amber-900 max-w-sm">
      <WifiOff className="w-4 h-4 shrink-0 text-amber-200" />
      <div>
        <p className="font-semibold text-white">Offline Mode</p>
        <p className="text-[11px] text-amber-100">Emergency hotlines and first-aid protocols remain available offline.</p>
      </div>
    </div>
  );
};
