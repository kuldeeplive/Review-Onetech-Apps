import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
      where: { email: email.toLowerCase().trim() },
      update: {
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        name: name || 'Super Admin',
      },
      create: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        name: name || 'Super Admin',
      },
    });

    return NextResponse.json({
      success: true,
      message: `Super Admin account for ${user.email} has been successfully created/updated!`,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Setup Admin error:', error);
    return NextResponse.json({ error: error.message || 'Failed to setup admin' }, { status: 500 });
  }
}
