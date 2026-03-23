'use client';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'white';
  className?: string;
}

const sizes = {
  sm: { icon: 18, text: 'text-[15px]' },
  md: { icon: 22, text: 'text-[17px]' },
  lg: { icon: 28, text: 'text-xl' },
};

export default function Logo({ size = 'md', variant = 'default', className = '' }: LogoProps) {
  const s = sizes[size];
  const iconColor = variant === 'white' ? 'text-white' : 'text-indigo-600';
  const textColor = variant === 'white' ? 'text-white' : 'text-gray-900';
  const accentColor = variant === 'white' ? 'text-indigo-200' : 'text-indigo-600';

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 24 24"
        fill="none"
        className={`${iconColor} flex-shrink-0`}
      >
        {/* Shield body */}
        <path
          d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"
          fill="currentColor"
          opacity="0.12"
        />
        <path
          d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
        {/* Contract document lines */}
        <path
          d="M8 10h8M8 13h5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Checkmark */}
        <path
          d="M14.5 13l1.5 1.5 3-3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.8"
        />
      </svg>
      <span
        className={`${s.text} font-semibold tracking-tight ${textColor}`}
        style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}
      >
        deal<span className={accentColor}>wise</span>
      </span>
    </span>
  );
}
