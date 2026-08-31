import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const authUser = await getCurrentUser();
    if (!authUser || !authUser.businessId) {
      return NextResponse.json({ error: 'Unauthorized or no business found' }, { status: 401 });
    }

    const business = await prisma.business.findUnique({
      where: { id: authUser.businessId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Compute scans this month
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const scansThisMonth = await prisma.scanAnalytics.count({
      where: {
        businessId: business.id,
        createdAt: { gte: startOfMonth },
      },
    });

    // Check plan expiration
    const now = new Date();
    const isExpired = business.planExpiresAt ? new Date(business.planExpiresAt) < now : false;
    let daysRemaining = null;
    if (business.planExpiresAt) {
      const diffTime = new Date(business.planExpiresAt).getTime() - now.getTime();
      daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    // If transactions list is empty, synthesize initial onboarding transaction so user sees billing history
    let transactionsList = business.transactions;
    if (transactionsList.length === 0) {
      transactionsList = [
        {
          id: `tx_${business.id.slice(-6)}`,
          businessId: business.id,
          planName: business.planName || 'Pro Plan',
          amount: business.planPrice || '₹999/mo',
          durationDays: 365,
          status: isExpired ? 'EXPIRED' : 'PAID',
          paymentMethod: 'DIRECT_ADMIN',
          notes: 'Initial Plan Activation',
          createdAt: business.createdAt,
        },
      ];
    }

    return NextResponse.json({
      plan: {
        name: business.planName || 'Pro Plan',
        price: business.planPrice || '₹999/mo',
        expiresAt: business.planExpiresAt,
        isExpired,
        daysRemaining,
        isActive: business.isActive,
        monthlyScanLimit: business.monthlyScanLimit ?? 500,
        scansThisMonth,
      },
      transactions: transactionsList,
    });
  } catch (error: any) {
    console.error('Fetch business subscription error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}
