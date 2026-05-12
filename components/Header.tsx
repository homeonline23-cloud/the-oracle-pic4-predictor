'use client';

import PageHeader from '@/components/PageHeader';

export default function Header({ showTitle = true }: { showTitle?: boolean }) {
  if (!showTitle) return null;
  return (
    <header className="mb-8 flex w-full flex-col items-center px-4 pb-4 pt-8 text-center font-outfit md:mb-12 md:pt-16">
      <PageHeader />
    </header>
  );
}
