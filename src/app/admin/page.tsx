'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';

interface Stats {
  totalUsers: number;
  warnedUsers: number;
  bannedUsers: number;
  totalReportImages: number;
  totalAvatars: number;
  totalCleanupPhotos: number;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [usersRes, imagesRes] = await Promise.all([
          fetch('/api/admin/users'),
          fetch('/api/admin/images'),
        ]);
        const usersData = await usersRes.json();
        const imagesData = await imagesRes.json();

        const users = usersData.users || [];
        const images = imagesData.images || [];

        setStats({
          totalUsers: users.length,
          warnedUsers: users.filter((u: { status: string }) => u.status === 'warned').length,
          bannedUsers: users.filter((u: { status: string }) => u.status === 'banned').length,
          totalReportImages: images.filter((i: { source: string }) => i.source === 'report').length,
          totalAvatars: images.filter((i: { source: string }) => i.source === 'avatar').length,
          totalCleanupPhotos: images.filter((i: { source: string }) => i.source === 'cleanup').length,
        });
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const statCards = stats
    ? [
        { label: 'Total users', value: stats.totalUsers, href: '/admin/users', color: 'text-brand-600' },
        { label: 'Warned users', value: stats.warnedUsers, href: '/admin/users?filter=warned', color: 'text-amber-600' },
        { label: 'Banned users', value: stats.bannedUsers, href: '/admin/users?filter=banned', color: 'text-red-600' },
        { label: 'Report images', value: stats.totalReportImages, href: '/admin/images?source=report', color: 'text-brand-600' },
        { label: 'Avatars', value: stats.totalAvatars, href: '/admin/images?source=avatar', color: 'text-brand-600' },
        { label: 'Cleanup photos', value: stats.totalCleanupPhotos, href: '/admin/images?source=cleanup', color: 'text-brand-600' },
      ]
    : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-loam mb-6">Admin Overview</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card className="hover:shadow-md transition-shadow">
              <p className="text-xs font-medium text-weathered uppercase tracking-wide">{card.label}</p>
              <p className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
