'use client';

import { useState, ReactNode } from 'react';

interface TabsProps {
  items: string[];
  children: ReactNode;
}

interface TabsContentProps {
  value: string;
  children: ReactNode;
}

export function Tabs({ items, children }: TabsProps) {
  const [activeTab, setActiveTab] = useState(items[0]);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        {items.map((item) => (
          <button
            key={item}
            onClick={() => setActiveTab(item)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === item
                ? 'bg-white dark:bg-gray-800 border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="p-4 bg-white dark:bg-gray-800">{children}</div>
    </div>
  );
}

export function Tab({ value, children }: TabsContentProps) {
  return <div data-tab-value={value}>{children}</div>;
}
