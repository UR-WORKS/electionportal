'use client';

export function PerformanceAnalytics({ 
  polled, 
  total, 
  label = "CANDIDATE VS ELECTORATE"
}: { 
  polled: number; 
  total: number; 
  label?: string;
}) {
  const percentage = total > 0 ? (polled / total) * 100 : 0;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(percentage, 100);
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm flex flex-col items-center justify-center h-full min-h-[280px]">
      <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest mb-8 self-start">
        {label}
      </h3>
      
      <div className="relative flex items-center justify-center w-full">
        <svg className="w-56 h-56 transform -rotate-90">
          {/* Background Ring - Deep Navy */}
          <circle
            cx="112"
            cy="112"
            r={radius}
            stroke="#0B1229"
            strokeWidth="24"
            fill="transparent"
          />
          {/* Progress Ring - Gradient */}
          <circle
            cx="112"
            cy="112"
            r={radius}
            stroke="url(#gauge-gradient)"
            strokeWidth="24"
            strokeDasharray={circumference}
            style={{ 
              strokeDashoffset: offset, 
              transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' 
            }}
            strokeLinecap="butt"
            fill="transparent"
          />
          <defs>
            <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0891b2" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-black text-gray-900 tracking-tighter">
            {percentage.toFixed(1)}%
          </span>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-2">
            {polled.toLocaleString()} / {total.toLocaleString()}
          </span>
        </div>
        
        {/* Progress Handle / Indicator */}
        <div 
          className="absolute w-5 h-5 bg-cyan-400 rounded-full border-[3px] border-[#0B1229] shadow-lg transition-all duration-[1.5s] ease-[cubic-bezier(0.4, 0, 0.2, 1)]"
          style={{
            transform: `rotate(${ (progress / 100) * 360 }deg) translateY(-${radius}px)`,
            top: 'calc(50% - 10px)',
            left: 'calc(50% - 10px)',
          }}
        />
      </div>
    </div>
  );
}
