'use client';

import Link from 'next/link';
import { Shield } from 'lucide-react';

const footerLinks = {
  product: [
    { label: 'Analyze', href: '/analyze' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Blog', href: '/blog' },
    { label: 'Templates', href: '/templates' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Refund Policy', href: '/refund' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Acceptable Use', href: '/acceptable-use' },
  ],
  support: [
    { label: 'Contact', href: '/contact' },
    { label: 'Report Issue', href: '/contact?type=issue' },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {/* Brand column */}
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-600" />
              <span className="text-[16px] font-bold text-gray-900">
                dealwise
              </span>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-gray-400 max-w-[200px]">
              AI-powered contract analysis for freelancers
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-gray-400 mb-3">
              Product
            </p>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-gray-500 transition-colors hover:text-gray-700"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-gray-400 mb-3">
              Legal
            </p>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-gray-500 transition-colors hover:text-gray-700"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-gray-400 mb-3">
              Support
            </p>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-gray-500 transition-colors hover:text-gray-700"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-gray-100 pt-6">
          <p className="text-center text-[13px] text-gray-400">
            &copy; 2026 dealwise. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
