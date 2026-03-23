'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { FileText, ShieldCheck, Globe } from 'lucide-react';

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 1500;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref} className="font-bold text-gray-900">
      {count}{suffix}
    </span>
  );
}

const stats = [
  { icon: FileText, value: 500, suffix: '+', label: 'contracts analyzed' },
  { icon: ShieldCheck, value: 30, suffix: '+', label: 'red flag patterns' },
  { icon: Globe, value: 6, suffix: '', label: 'countries supported' },
];

export default function SocialProofBar() {
  return (
    <section className="bg-gray-50 border-y border-gray-100 px-6 py-5">
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-6 sm:flex-row sm:gap-12">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="flex items-center gap-2.5 text-[14px] text-gray-500"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <stat.icon className="h-4 w-4 text-indigo-500" />
            <span>
              <AnimatedCounter target={stat.value} suffix={stat.suffix} /> {stat.label}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
