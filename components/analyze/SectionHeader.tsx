'use client';

export default function SectionHeader({
  icon: Icon,
  title,
  count,
  color = 'text-gray-900',
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  count?: number;
  color?: string;
}) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <Icon className={`h-5 w-5 ${color}`} />
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {count !== undefined && (
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
          {count}
        </span>
      )}
    </div>
  );
}
