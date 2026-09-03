import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'AGENCY' || !user.agencyId) {
      return NextResponse.json({ error: 'Unauthorized agency partner' }, { status: 403 });
    }

    const body = await req.json();
    const {
      brandName,
      logoUrl,
      themeColor,
      customFooterText,
      customFooterUrl,
      supportEmail,
      supportPhone,
    } = body;

    const updateData: any = {};
    if (brandName !== undefined) updateData.brandName = brandName.trim();
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl?.trim() || null;
    if (themeColor !== undefined) updateData.themeColor = themeColor?.trim() || '#2563eb';
    if (customFooterText !== undefined) updateData.customFooterText = customFooterText.trim();
    if (customFooterUrl !== undefined) updateData.customFooterUrl = customFooterUrl.trim();
    if (supportEmail !== undefined) updateData.supportEmail = supportEmail?.trim() || null;
    if (supportPhone !== undefined) updateData.supportPhone = supportPhone?.trim() || null;

    const updatedAgency = await prisma.agency.update({
      where: { id: user.agencyId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'White-label brand identity updated successfully!',
      agency: updatedAgency,
    });
  } catch (error: any) {
    console.error('Update agency brand settings error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update brand settings' }, { status: 500 });
  }
}
