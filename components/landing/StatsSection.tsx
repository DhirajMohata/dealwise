'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { FadeInView } from '@/components/ui';

const serifStyle: React.CSSProperties = {
  fontFamily: 'var(--font-serif), Georgia, serif',
};

function AnimatedStat({ value, suffix = '', prefix = '' }: { value: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 1200;
    const increment = value / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {prefix}{count}{suffix}
    </span>
  );
}

const stats = [
  { value: 30, suffix: '+', label: 'red flag patterns' },
  { value: 6, suffix: '', label: "countries' legal context" },
  { value: 30, suffix: 's', label: 'average analysis time' },
  { value: 0, prefix: '$', suffix: '', label: 'to start (5 free credits)' },
];

export default function StatsSection() {
  return (
    <section className="bg-white px-6 py-16">
      <div className="mx-auto max-w-5xl text-center">
        <FadeInView>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <p
                  className="text-[48px] font-bold text-gray-900"
                  style={serifStyle}
                >
                  <AnimatedStat value={stat.value} suffix={stat.suffix} prefix={stat.prefix || ''} />
                </p>
                <p className="mt-1 text-[14px] text-gray-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
          <p className="mt-8 text-[14px] text-gray-400">
            Legal context for the US, India, UK, EU, Australia, and Canada.
          </p>
        </FadeInView>
      </div>
    </section>
  );
}
