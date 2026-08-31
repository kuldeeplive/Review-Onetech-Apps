import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { signToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        businesses: {
          select: {
            id: true,
            slug: true,
            name: true,
            isActive: true,
            planExpiresAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // If Business Owner, check if business is active
    if (user.role === 'BUSINESS_OWNER') {
      const business = user.businesses[0];
      if (business && !business.isActive) {
        return NextResponse.json(
          { error: 'Your business account is currently inactive. Please contact the administrator.' },
          { status: 403 }
        );
      }
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      businessId: user.businesses[0]?.id || null,
      businessSlug: user.businesses[0]?.slug || null,
    };

    const token = signToken(tokenPayload);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        business: user.businesses[0] || null,
      },
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error during login' }, { status: 500 });
  }
}
