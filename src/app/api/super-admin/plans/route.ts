import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function ensureSuperAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'SUPER_ADMIN') {
    return null;
  }
  return user;
}

// GET all plans
export async function GET() {
  try {
    const admin = await ensureSuperAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    let plans = await prisma.plan.findMany({
      orderBy: { createdAt: 'asc' },
    });

    // If no plans exist yet, initialize default plans
    if (plans.length === 0) {
      const defaultPlans = [
        {
          name: 'Starter Plan',
          price: '₹499/mo',
          durationDays: 365,
          monthlyScanLimit: 100,
          features: 'Google 5-Star Review Booster, Standee QR Generator, Basic Analytics',
          badge: 'Starter',
          isActive: true,
        },
        {
          name: 'Pro Plan',
          price: '₹999/mo',
          durationDays: 365,
          monthlyScanLimit: 500,
          features: 'AI Smart Review Generator, QR Standee Studio, Private Negative Feedback Gating, WhatsApp & Email Alerts, Custom Discount Offers',
          badge: 'Most Popular',
          isActive: true,
        },
        {
          name: 'Enterprise Plan',
          price: '₹2,999/yr',
          durationDays: 365,
          monthlyScanLimit: 5000,
          features: 'Everything in Pro, 5,000 Monthly Scans, Multi-Location Priority, Dedicated Support, Custom Review Prompts',
          badge: 'Best Value',
          isActive: true,
        },
        {
          name: 'VIP Unlimited Plan',
          price: '₹4,999/yr',
          durationDays: 365,
          monthlyScanLimit: -1,
          features: 'Unlimited QR Scans, All AI Engine Features, Priority Live Support, Lifetime Standee Assets, Advanced Dispute Recovery',
          badge: 'VIP Unlimited',
          isActive: true,
        },
      ];

      for (const p of defaultPlans) {
        await prisma.plan.create({ data: p });
      }

      plans = await prisma.plan.findMany({
        orderBy: { createdAt: 'asc' },
      });
    }

    return NextResponse.json({ plans });
  } catch (error: any) {
    console.error('Fetch plans error:', error);
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
  }
}

// POST: Create a new plan
export async function POST(req: Request) {
  try {
    const admin = await ensureSuperAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { name, price, durationDays, monthlyScanLimit, features, badge, isActive } =
      await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Plan name is required' }, { status: 400 });
    }

    const existing = await prisma.plan.findUnique({
      where: { name: name.trim() },
    });

    if (existing) {
      return NextResponse.json({ error: 'A plan with this name already exists' }, { status: 400 });
    }

    const newPlan = await prisma.plan.create({
      data: {
        name: name.trim(),
        price: price || '₹999/mo',
        durationDays: Number(durationDays) || 365,
        monthlyScanLimit: monthlyScanLimit !== undefined ? Number(monthlyScanLimit) : 500,
        features: features || 'AI Smart Reviews, QR Studio, Negative Review Interception',
        badge: badge?.trim() || null,
        isActive: typeof isActive === 'boolean' ? isActive : true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Plan created successfully!',
      plan: newPlan,
    });
  } catch (error: any) {
    console.error('Create plan error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create plan' }, { status: 500 });
  }
}

// PATCH: Edit existing plan
export async function PATCH(req: Request) {
  try {
    const admin = await ensureSuperAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id, name, price, durationDays, monthlyScanLimit, features, badge, isActive } =
      await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    const updated = await prisma.plan.update({
      where: { id },
      data: {
        name: name ? name.trim() : undefined,
        price: price !== undefined ? price : undefined,
        durationDays: durationDays !== undefined ? Number(durationDays) : undefined,
        monthlyScanLimit: monthlyScanLimit !== undefined ? Number(monthlyScanLimit) : undefined,
        features: features !== undefined ? features : undefined,
        badge: badge !== undefined ? (badge ? badge.trim() : null) : undefined,
        isActive: typeof isActive === 'boolean' ? isActive : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Plan updated successfully!',
      plan: updated,
    });
  } catch (error: any) {
    console.error('Update plan error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update plan' }, { status: 500 });
  }
}

// DELETE: Delete plan
export async function DELETE(req: Request) {
  try {
    const admin = await ensureSuperAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    await prisma.plan.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Plan deleted successfully!',
    });
  } catch (error: any) {
    console.error('Delete plan error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete plan' }, { status: 500 });
  }
}
