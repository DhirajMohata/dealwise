"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

// ============================================================
// BUTTON
// ============================================================
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, icon, children, className = "", disabled, ...props }, ref) => {
    const base = "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary: "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 focus:ring-indigo-500",
      secondary: "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:ring-gray-300",
      ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-300",
      danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-500",
      outline: "border border-indigo-200 text-indigo-600 bg-white hover:bg-indigo-50 focus:ring-indigo-500",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

// ============================================================
// CARD
// ============================================================
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
  variant?: "default" | "elevated" | "subtle";
}

export function Card({ hover = false, padding = "md", variant = "default", className = "", children, ...props }: CardProps) {
  const paddings = { sm: "p-4", md: "p-6", lg: "p-8" };
  const variants = {
    default: "bg-white border border-gray-200 shadow-xs",
    elevated: "bg-white border border-gray-200 shadow-sm",
    subtle: "bg-gray-50 border border-gray-200",
  };
  const hoverClass = hover ? "hover:shadow-sm hover:-translate-y-px hover:border-gray-300 transition-all duration-200" : "";

  return (
    <div className={`rounded-xl ${variants[variant]} ${paddings[padding]} ${hoverClass} ${className}`} {...props}>
      {children}
    </div>
  );
}

// ============================================================
// INPUT
// ============================================================
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div>
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-xs font-medium text-gray-600">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors ${
            error ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/10" : "border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

// ============================================================
// TEXTAREA
// ============================================================
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div>
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-xs font-medium text-gray-600">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={`w-full resize-y rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors ${
            error ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/10" : "border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

// ============================================================
// SELECT
// ============================================================
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div>
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-xs font-medium text-gray-600">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={inputId}
            className={`w-full appearance-none rounded-lg border bg-white px-3.5 py-2.5 pr-10 text-sm text-gray-900 outline-none transition-colors ${
              error ? "border-red-300 focus:border-red-500" : "border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
            } ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-white text-gray-900">
                {opt.label}
              </option>
            ))}
          </select>
          <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 9 6 6 6-6" /></svg>
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";

// ============================================================
// BADGE
// ============================================================
interface BadgeProps {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "critical" | "high" | "medium" | "low";
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  const variants = {
    default: "bg-gray-100 text-gray-700 border-gray-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-red-50 text-red-700 border-red-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
    critical: "bg-red-50 text-red-700 border-red-200",
    high: "bg-orange-50 text-orange-700 border-orange-200",
    medium: "bg-amber-50 text-amber-700 border-amber-200",
    low: "bg-blue-50 text-blue-700 border-blue-200",
  };

  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

// ============================================================
// SECTION HEADER
// ============================================================
interface SectionHeaderProps {
  overline?: string;
  title: string;
  description?: string;
  className?: string;
}

export function SectionHeader({ overline, title, description, className = "" }: SectionHeaderProps) {
  return (
    <div className={`mb-8 ${className}`}>
      {overline && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">{overline}</p>
      )}
      <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{title}</h2>
      {description && (
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-gray-500">{description}</p>
      )}
    </div>
  );
}

// ============================================================
// PAGE WRAPPER
// ============================================================
export function PageWrapper({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`min-h-screen bg-white ${className}`}>
      {children}
    </div>
  );
}

export function PageContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mx-auto max-w-7xl px-4 pb-24 pt-24 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

// ============================================================
// SERIF STYLE — reusable across all pages
// ============================================================
export const serifStyle: React.CSSProperties = { fontFamily: "var(--font-serif), Georgia, serif" };

// ============================================================
// PAGE HEADER — consistent serif heading for all tool pages
// ============================================================
interface PageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, backHref, backLabel, children, className = "" }: PageHeaderProps) {
  return (
    <FadeIn className={className}>
      <div className="mb-8">
        {backHref && (
          <a href={backHref} className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {backLabel || "Back"}
          </a>
        )}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl" style={serifStyle}>
              {title}
            </h1>
            {description && (
              <p className="mt-2 text-base text-gray-500">{description}</p>
            )}
          </div>
          {children}
        </div>
      </div>
    </FadeIn>
  );
}

// ============================================================
// EMPTY STATE
// ============================================================
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="mb-4 text-gray-400">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-gray-400">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

// ============================================================
// ANIMATED FADE IN
// ============================================================
export function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FadeInView({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================================
// STAT CARD (for dashboard)
// ============================================================
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}

export function StatCard({ icon, label, value, subtitle, color = "text-indigo-600" }: StatCardProps) {
  return (
    <Card padding="md">
      <div className="flex items-start gap-4">
        <div className="rounded-lg bg-gray-50 p-3 text-gray-500">{icon}</div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{label}</p>
          <p className={`mt-1 text-2xl font-bold tracking-tight ${color}`}>{value}</p>
          {subtitle && <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>}
        </div>
      </div>
    </Card>
  );
}

// ============================================================
// TOOLTIP (simple)
// ============================================================
export function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <span className="group relative inline-block">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        {text}
        <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
      </span>
    </span>
  );
}
