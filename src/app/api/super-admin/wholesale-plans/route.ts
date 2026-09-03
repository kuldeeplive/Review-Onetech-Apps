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

// GET all Wholesale Plans (auto-seed defaults if empty)
export async function GET() {
  try {
    const admin = await ensureSuperAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    let plans = await prisma.wholesalePlan.findMany({
      orderBy: { pricePerMonth: 'asc' },
      include: {
        _count: {
          select: { businesses: true },
        },
      },
    });

    // Auto-seed default wholesale tiers if empty
    if (plans.length === 0) {
      const defaultWholesaleTiers = [
        {
          name: 'Wholesale Starter',
          pricePerMonth: 99.0,
          pricePerYear: 999.0,
          monthlyScanLimit: 100,
          description: 'Basic QR review redirection, up to 100 scans per month.',
          isActive: true,
        },
        {
          name: 'Wholesale Pro',
          pricePerMonth: 249.0,
          pricePerYear: 2199.0,
          monthlyScanLimit: 500,
          description: 'Full AI Review Assistant, 500 scans/mo, Standee Studio, Private Gating.',
          isActive: true,
        },
        {
          name: 'Wholesale VIP',
          pricePerMonth: 499.0,
          pricePerYear: 4499.0,
          monthlyScanLimit: 2000,
          description: 'High-volume clients, 2,000 scans/mo, priority multi-language AI.',
          isActive: true,
        },
        {
          name: 'Wholesale Unlimited',
          pricePerMonth: 799.0,
          pricePerYear: 6999.0,
          monthlyScanLimit: -1,
          description: 'Unlimited scans/month, enterprise reputation protection.',
          isActive: true,
        },
      ];

      for (const tier of defaultWholesaleTiers) {
        await prisma.wholesalePlan.create({ data: tier });
      }

      plans = await prisma.wholesalePlan.findMany({
        orderBy: { pricePerMonth: 'asc' },
        include: {
          _count: {
            select: { businesses: true },
          },
        },
      });
    }

    return NextResponse.json({ plans });
  } catch (error: any) {
    console.error('Fetch wholesale plans error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch wholesale plans' }, { status: 500 });
  }
}

// POST create a Wholesale Plan
export async function POST(req: Request) {
  try {
    const admin = await ensureSuperAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { name, pricePerMonth, pricePerYear, monthlyScanLimit, description } = await req.json();

    if (!name || pricePerMonth === undefined) {
      return NextResponse.json({ error: 'Plan name and monthly wholesale price are required' }, { status: 400 });
    }

    const existing = await prisma.wholesalePlan.findUnique({
      where: { name: name.trim() },
    });

    if (existing) {
      return NextResponse.json({ error: 'A wholesale plan with this name already exists' }, { status: 400 });
    }

    const plan = await prisma.wholesalePlan.create({
      data: {
        name: name.trim(),
        pricePerMonth: Number(pricePerMonth),
        pricePerYear: Number(pricePerYear || Number(pricePerMonth) * 10),
        monthlyScanLimit: Number(monthlyScanLimit) !== undefined ? Number(monthlyScanLimit) : 500,
        description: description?.trim() || null,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, plan });
  } catch (error: any) {
    console.error('Create wholesale plan error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create wholesale plan' }, { status: 500 });
  }
}

// PATCH update Wholesale Plan
export async function PATCH(req: Request) {
  try {
    const admin = await ensureSuperAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id, name, pricePerMonth, pricePerYear, monthlyScanLimit, description, isActive } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (pricePerMonth !== undefined) updateData.pricePerMonth = Number(pricePerMonth);
    if (pricePerYear !== undefined) updateData.pricePerYear = Number(pricePerYear);
    if (monthlyScanLimit !== undefined) updateData.monthlyScanLimit = Number(monthlyScanLimit);
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const updatedPlan = await prisma.wholesalePlan.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, plan: updatedPlan });
  } catch (error: any) {
    console.error('Update wholesale plan error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update wholesale plan' }, { status: 500 });
  }
}

// DELETE or deactivate Wholesale Plan
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

    // Check if businesses are assigned to this plan
    const attachedCount = await prisma.business.count({
      where: { wholesalePlanId: id },
    });

    if (attachedCount > 0) {
      // Deactivate instead of hard delete to prevent orphan relation
      await prisma.wholesalePlan.update({
        where: { id },
        data: { isActive: false },
      });
      return NextResponse.json({
        success: true,
        message: 'Plan has active clients assigned. It has been deactivated instead of deleted.',
      });
    }

    await prisma.wholesalePlan.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Wholesale plan deleted successfully' });
  } catch (error: any) {
    console.error('Delete wholesale plan error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete wholesale plan' }, { status: 500 });
  }
}
