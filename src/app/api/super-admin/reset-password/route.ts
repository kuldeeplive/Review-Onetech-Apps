import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Super Admin access required.' }, { status: 403 });
    }

    const body = await req.json();
    const { businessId, customPassword } = body;

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 });
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { owner: true },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Generate random password if custom password not provided
    const newPassword =
      customPassword && customPassword.trim() !== ''
        ? customPassword.trim()
        : `Pass${Math.floor(1000 + Math.random() * 9000)}`;

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password in DB
    await prisma.user.update({
      where: { id: business.ownerId },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      success: true,
      message: `Password reset successfully for ${business.owner.email}`,
      credentials: {
        businessName: business.name,
        email: business.owner.email,
        newPassword: newPassword,
        loginUrl: `${req.headers.get('origin') || ''}/login`,
        reviewUrl: `${req.headers.get('origin') || ''}/review/${business.slug}`,
      },
    });
  } catch (error: any) {
    console.error('Password reset error:', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
