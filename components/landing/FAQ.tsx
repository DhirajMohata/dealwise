'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { FadeInView } from '@/components/ui';
import { useTranslations } from 'next-intl';

const serifStyle: React.CSSProperties = {
  fontFamily: 'var(--font-serif), Georgia, serif',
};

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="text-[15px] font-semibold text-gray-900 pr-4">
          {question}
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.2 }}
          className="pb-5"
        >
          <p className="text-[14px] leading-relaxed text-gray-500">{answer}</p>
        </motion.div>
      )}
    </div>
  );
}

const faqs = [
  {
    q: 'Is dealwise really free?',
    a: 'Yes! You get 5 free credits on signup with no credit card required. Each analysis uses 1 credit. When you need more, credit packs start at just $4.99.',
  },
  {
    q: 'Is my contract data safe?',
    a: 'Your contract text is processed in real time and discarded immediately after analysis. We never store your contract content on our servers. Only your account email and credit balance are stored.',
  },
  {
    q: 'How accurate is the analysis?',
    a: 'Our engine uses 30+ regex patterns combined with GPT-4o AI to catch issues. It\'s designed to be a powerful first-pass analysis tool, but it\'s not a substitute for professional legal advice.',
  },
  {
    q: 'What types of contracts work?',
    a: 'Freelance, consulting, design, development, writing, marketing \u2014 any contract where you\'re an independent contractor or service provider.',
  },
  {
    q: 'Do I need an account?',
    a: 'Create a free account to get 5 credits. Each analysis uses 1 credit. No credit card required.',
  },
  {
    q: 'How does DealWise compare to hiring a lawyer?',
    a: 'DealWise provides a thorough first-pass analysis, catching 30+ red flag patterns in seconds for a fraction of the cost. For complex high-value contracts, we recommend using DealWise as a screening tool, then consulting a lawyer for anything that needs deeper review.',
  },
  {
    q: 'What file formats are supported?',
    a: 'We support PDF, DOCX, and plain text. You can upload a file directly or paste your contract text into the editor.',
  },
  {
    q: 'What do credits cover?',
    a: '1 credit = 1 contract analysis. Chat, PDF export, negotiation emails, and all other features are completely free and unlimited.',
  },
];

export default function FAQ() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const t = useTranslations('landing');

  return (
    <section className="bg-white px-6 py-20">
      <div className="mx-auto max-w-2xl">
        <FadeInView>
          <div className="text-center">
            <h2
              className="text-[28px] font-bold tracking-tight text-gray-900 md:text-[36px]"
              style={serifStyle}
            >
              {t('faq.title')}
            </h2>
          </div>
        </FadeInView>

        <FadeInView delay={0.1}>
          <div className="mt-10 rounded-xl border border-gray-200 bg-white px-6">
            {faqs.map((faq, i) => (
              <FaqItem
                key={i}
                question={faq.q}
                answer={faq.a}
                isOpen={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        </FadeInView>
      </div>
    </section>
  );
}
