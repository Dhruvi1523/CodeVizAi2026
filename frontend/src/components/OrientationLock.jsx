import React from 'react';
import { Smartphone } from 'lucide-react';

export default function OrientationLock() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a] text-[#f1f5f9] lg:hidden">
      <div className="text-center p-4">
        <Smartphone className="mx-auto h-16 w-16 mb-4 animate-pulse" />
        <h2 className="text-2xl font-bold">Please Rotate Your Device</h2>
        <p className="mt-2 text-[#94a3b8]">
          This experience is best viewed in landscape mode.
        </p>
      </div>
    </div>
  );
}