import { NextResponse } from 'next/server';
import { getCurrentUser, signToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Impersonate a client (Super Admin or Agency Owner)
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'AGENCY')) {
      return NextResponse.json({ error: 'Unauthorized. Admin or Agency access required.' }, { status: 403 });
    }

    const { businessId } = await req.json();
    if (!businessId) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 });
    }

    const targetBusiness = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        owner: true,
        agency: true,
      },
    });

    if (!targetBusiness) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Security check: If Agency, can only impersonate their own clients!
    if (user.role === 'AGENCY' && targetBusiness.agencyId !== user.agencyId) {
      return NextResponse.json({ error: 'Unauthorized. You can only manage your own clients.' }, { status: 403 });
    }

    const tokenPayload = {
      userId: user.userId,
      email: user.email,
      role: 'BUSINESS_OWNER',
      impersonatedBusinessId: targetBusiness.id,
      impersonatedBusinessSlug: targetBusiness.slug,
      isImpersonating: true,
      originalRole: user.role,
      originalAgencyId: user.agencyId || null,
      originalSuperAdminId: user.userId,
    };

    const token = signToken(tokenPayload);

    const response = NextResponse.json({
      success: true,
      message: `Now managing ${targetBusiness.name}`,
      businessSlug: targetBusiness.slug,
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 1 * 24 * 60 * 60, // 1 day
    });

    return response;
  } catch (error: any) {
    console.error('Impersonation error:', error);
    return NextResponse.json({ error: 'Failed to switch to client mode' }, { status: 500 });
  }
}

// Exit impersonation and return to Super Admin or Agency Portal
export async function DELETE() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Re-fetch original user
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      include: { agency: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isAgency = dbUser.role === 'AGENCY';
    const tokenPayload: any = {
      userId: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
    };

    if (isAgency && dbUser.agency) {
      tokenPayload.agencyId = dbUser.agency.id;
      tokenPayload.agencySlug = dbUser.agency.slug;
      tokenPayload.agencyName = dbUser.agency.name;
    }

    const token = signToken(tokenPayload);

    const response = NextResponse.json({
      success: true,
      role: dbUser.role,
      returnUrl: isAgency ? '/agency' : '/super-admin',
      message: isAgency ? 'Returned to Agency Portal' : 'Returned to Super Admin panel',
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('Exit impersonation error:', error);
    return NextResponse.json({ error: 'Failed to revert impersonation' }, { status: 500 });
  }
}
