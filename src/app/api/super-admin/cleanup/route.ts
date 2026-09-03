import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Inspect scan storage and counts
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Super Admin access required.' }, { status: 403 });
    }

    // Strict 60-day cutoff: Current time minus exactly 60 days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 60);

    const totalScans = await prisma.scanAnalytics.count();
    
    // Active scans in last 60 days (100% PROTECTED, never deleted)
    const activeScansCount = await prisma.scanAnalytics.count({
      where: {
        createdAt: { gte: cutoffDate },
      },
    });

    // Old scans created strictly BEFORE 60 days ago
    const prunableScansCount = await prisma.scanAnalytics.count({
      where: {
        createdAt: { lt: cutoffDate },
      },
    });

    // Check if auto-prune was requested
    const { searchParams } = new URL(req.url);
    let autoCleaned = 0;
    if (searchParams.get('auto') === 'true' && prunableScansCount > 0) {
      const deleted = await prisma.scanAnalytics.deleteMany({
        where: { createdAt: { lt: cutoffDate } },
      });
      autoCleaned = deleted.count;
    }

    return NextResponse.json({
      totalScans: autoCleaned > 0 ? totalScans - autoCleaned : totalScans,
      activeScansCount,
      prunableScansCount: autoCleaned > 0 ? 0 : prunableScansCount,
      cutoffDate: cutoffDate.toISOString(),
      retentionDays: 60,
      autoCleaned,
    });
  } catch (error: any) {
    console.error('Error in scan cleanup GET:', error);
    return NextResponse.json({ error: error.message || 'Failed to inspect scan storage' }, { status: 500 });
  }
}

// POST: Execute cleanup of old scans (>60 days strictly)
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Super Admin access required.' }, { status: 403 });
    }

    // Strict 60-day cutoff: Current time minus exactly 60 days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 60);

    // ONLY deletes records where createdAt is strictly less than cutoffDate (older than 60 days)
    const result = await prisma.scanAnalytics.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      cutoffDate: cutoffDate.toISOString(),
      retentionDays: 60,
      message: `Cleaned ${result.count} scan records older than 60 days. Current data (last 60 days) remains 100% safe.`,
    });
  } catch (error: any) {
    console.error('Error in scan cleanup POST:', error);
    return NextResponse.json({ error: error.message || 'Failed to clean old scans' }, { status: 500 });
  }
}
