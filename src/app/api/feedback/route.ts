import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getBillingCycleStart, getNextBillingResetDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

// GET /api/feedback - List feedbacks for business
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.businessId) {
      return NextResponse.json({ error: 'Unauthorized or no business linked' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const whereCondition: any = { businessId: user.businessId };
    if (status && status !== 'ALL') {
      whereCondition.status = status;
    }

    const feedbacks = await prisma.feedback.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
    });

    const allFeedbacks = await prisma.feedback.findMany({
      where: { businessId: user.businessId },
    });

    const business = await prisma.business.findUnique({
      where: { id: user.businessId },
      select: { monthlyScanLimit: true, planName: true, createdAt: true },
    });

    const cycleStart = getBillingCycleStart(business?.createdAt);

    const scans = await prisma.scanAnalytics.findMany({
      where: { businessId: user.businessId },
      select: { id: true, action: true, createdAt: true },
    });

    const scansThisCycle = scans.filter((s) => new Date(s.createdAt) >= cycleStart).length;
    const monthlyScanLimit = business?.monthlyScanLimit ?? 500;
    const isUnlimited = monthlyScanLimit === -1;
    const usagePercent = isUnlimited ? 0 : Math.min(100, Math.round((scansThisCycle / monthlyScanLimit) * 100));

    const metrics = {
      totalFeedbacks: allFeedbacks.length,
      pendingCount: allFeedbacks.filter((f) => f.status === 'PENDING').length,
      contactedCount: allFeedbacks.filter((f) => f.status === 'CONTACTED').length,
      resolvedCount: allFeedbacks.filter((f) => f.status === 'RESOLVED').length,
      totalScans: scans.length,
      scansThisMonth: scansThisCycle,
      monthlyScanLimit,
      isUnlimited,
      usagePercent,
      cycleResetDate: getNextBillingResetDate(business?.createdAt),
      planName: business?.planName || 'Pro Plan',
      positiveRedirects: scans.filter((s) => s.action === 'REDIRECTED_GOOGLE').length,
      avgRating: allFeedbacks.length
        ? (allFeedbacks.reduce((acc, f) => acc + f.rating, 0) / allFeedbacks.length).toFixed(1)
        : '5.0',
    };

    return NextResponse.json({
      feedbacks,
      metrics,
    });
  } catch (error: any) {
    console.error('Fetch feedback error:', error);
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
  }
}

// PATCH /api/feedback - Update feedback status and notes
export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.businessId) {
      return NextResponse.json({ error: 'Unauthorized or no business linked' }, { status: 401 });
    }

    const body = await req.json();
    const { feedbackId, status, resolutionNote } = body;

    if (!feedbackId || !status) {
      return NextResponse.json({ error: 'Feedback ID and Status are required' }, { status: 400 });
    }

    // Ensure feedback belongs to this business
    const feedback = await prisma.feedback.findFirst({
      where: {
        id: feedbackId,
        businessId: user.businessId,
      },
    });

    if (!feedback) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    }

    const updated = await prisma.feedback.update({
      where: { id: feedbackId },
      data: {
        status,
        resolutionNote: resolutionNote !== undefined ? resolutionNote : feedback.resolutionNote,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Feedback updated successfully',
      feedback: updated,
    });
  } catch (error: any) {
    console.error('Update feedback error:', error);
    return NextResponse.json({ error: 'Failed to update feedback' }, { status: 500 });
  }
}
