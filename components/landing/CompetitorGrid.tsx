'use client';

import { Check, X, Minus } from 'lucide-react';
import { FadeInView, Badge } from '@/components/ui';
import { useTranslations } from 'next-intl';

const serifStyle: React.CSSProperties = {
  fontFamily: 'var(--font-serif), Georgia, serif',
};

type CellStatus = 'yes' | 'no' | 'partial';

interface ComparisonRow {
  feature: string;
  dealwise: { status: CellStatus; label?: string };
  others: { status: CellStatus; label?: string };
  exclusive?: boolean;
}

const rows: ComparisonRow[] = [
  {
    feature: 'Effective hourly rate',
    dealwise: { status: 'yes' },
    others: { status: 'no' },
    exclusive: true,
  },
  {
    feature: 'Sign / negotiate / walk',
    dealwise: { status: 'yes' },
    others: { status: 'no' },
    exclusive: true,
  },
  {
    feature: 'What-If Simulator',
    dealwise: { status: 'yes' },
    others: { status: 'no' },
    exclusive: true,
  },
  {
    feature: 'Walk Away Calculator',
    dealwise: { status: 'yes' },
    others: { status: 'no' },
    exclusive: true,
  },
  {
    feature: 'Negotiation emails',
    dealwise: { status: 'yes' },
    others: { status: 'partial' },
  },
  {
    feature: 'Red flag detection',
    dealwise: { status: 'yes', label: '30+ patterns' },
    others: { status: 'yes', label: 'varies' },
  },
  {
    feature: 'AI contract chat',
    dealwise: { status: 'yes', label: 'FREE' },
    others: { status: 'partial', label: 'paid' },
  },
  {
    feature: 'Multi-country legal',
    dealwise: { status: 'yes', label: '6 countries' },
    others: { status: 'partial', label: 'limited' },
  },
  {
    feature: 'Free tier',
    dealwise: { status: 'yes', label: '5 credits, no card' },
    others: { status: 'partial', label: 'varies' },
  },
  {
    feature: 'Price',
    dealwise: { status: 'yes', label: '$0.20\u2013$0.50/analysis' },
    others: { status: 'no', label: '$3\u2013$30/analysis' },
  },
];

function StatusIcon({ status }: { status: CellStatus }) {
  if (status === 'yes')
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50">
        <Check className="h-3.5 w-3.5 text-emerald-600" />
      </div>
    );
  if (status === 'partial')
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
        <Minus className="h-3.5 w-3.5 text-gray-400" />
      </div>
    );
  return (
    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-50">
      <X className="h-3.5 w-3.5 text-gray-300" />
    </div>
  );
}

export default function CompetitorGrid() {
  const t = useTranslations('landing');

  return (
    <section className="bg-gray-50 px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <FadeInView>
          <div className="text-center">
            <h2
              className="text-[28px] font-bold tracking-tight text-gray-900 md:text-[36px]"
              style={serifStyle}
            >
              {t('comparison.title')}
            </h2>
          </div>
        </FadeInView>

        <FadeInView delay={0.1}>
          <div className="mt-12 overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full border-separate border-spacing-0 text-left text-[14px]">
              <thead>
                <tr>
                  <th className="border-b border-gray-200 px-5 py-4 text-[13px] font-medium text-gray-400 w-[40%]">
                    Feature
                  </th>
                  <th className="border-b border-gray-200 bg-indigo-50/70 px-5 py-4 text-center text-[13px] font-semibold text-indigo-700 w-[30%]">
                    <div className="flex items-center justify-center gap-2">
                      DealWise
                    </div>
                  </th>
                  <th className="border-b border-gray-200 px-5 py-4 text-center text-[13px] font-medium text-gray-400 w-[30%]">
                    Others
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.feature}>
                    <td
                      className={`px-5 py-3.5 font-medium text-gray-900 ${
                        i < rows.length - 1 ? 'border-b border-gray-100' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {row.feature}
                        {row.exclusive && (
                          <Badge variant="info" className="!text-[9px] !py-0 !px-1.5">
                            Exclusive
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td
                      className={`bg-indigo-50/30 px-5 py-3.5 ${
                        i < rows.length - 1 ? 'border-b border-gray-100' : ''
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <StatusIcon status={row.dealwise.status} />
                        {row.dealwise.label && (
                          <span className="text-[12px] font-medium text-gray-700">
                            {row.dealwise.label}
                          </span>
                        )}
                      </div>
                    </td>
                    <td
                      className={`px-5 py-3.5 ${
                        i < rows.length - 1 ? 'border-b border-gray-100' : ''
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <StatusIcon status={row.others.status} />
                        {row.others.label && (
                          <span className="text-[12px] text-gray-400">
                            {row.others.label}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-6 text-center text-[14px] text-gray-500">
            DealWise is the only tool that tells you how much money each clause
            is costing you.
          </p>
        </FadeInView>
      </div>
    </section>
  );
}
