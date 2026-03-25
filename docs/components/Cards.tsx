'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface CardProps {
  title: string;
  href: string;
  icon?: ReactNode;
  children?: ReactNode;
}

interface CardsProps {
  children: ReactNode;
}

export function Card({ title, href, icon, children }: CardProps) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 transition-all hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg dark:hover:shadow-blue-500/20"
    >
      {icon && <div className="mb-2 text-2xl">{icon}</div>}
      <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
        {title}
      </h3>
      {children && <p className="text-sm text-gray-600 dark:text-gray-400">{children}</p>}
    </Link>
  );
}

export function Cards({ children }: CardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 my-6">
      {children}
    </div>
  );
}
