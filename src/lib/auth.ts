import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-for-saas-reputation-manager-2026';

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'BUSINESS_OWNER';
  businessId?: string;
  businessSlug?: string;
  isImpersonating?: boolean;
}

export function signToken(payload: object, expiresIn: string | number = '7d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as any });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser(): Promise<AuthSession | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return null;
  }

  const decoded = verifyToken(token);
  if (!decoded || !decoded.userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
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
    return null;
  }

  const business = user.businesses[0];

  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role as 'SUPER_ADMIN' | 'BUSINESS_OWNER',
    businessId: decoded.impersonatedBusinessId || business?.id,
    businessSlug: decoded.impersonatedBusinessSlug || business?.slug,
    isImpersonating: !!decoded.isImpersonating,
  };
}
