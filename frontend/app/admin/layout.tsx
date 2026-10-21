import type { Metadata } from 'next';

// La page d'administration ne doit pas apparaître dans Google
export const metadata: Metadata = {
  title: 'Administration – avis',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
