import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const agencySlug = searchParams.get('agency') || searchParams.get('slug');

    if (!agencySlug) {
      return NextResponse.json({ error: 'Agency slug required' }, { status: 400 });
    }

    const agency = await prisma.agency.findUnique({
      where: { slug: agencySlug.toLowerCase().trim() },
      select: {
        id: true,
        name: true,
        slug: true,
        brandName: true,
        logoUrl: true,
        themeColor: true,
        customFooterText: true,
        customFooterUrl: true,
        supportEmail: true,
        supportPhone: true,
        isActive: true,
      },
    });

    if (!agency || !agency.isActive) {
      return NextResponse.json({ error: 'Agency not found or inactive' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      brand: {
        name: agency.name,
        brandName: agency.brandName || agency.name,
        logoUrl: agency.logoUrl,
        themeColor: agency.themeColor || '#2563eb',
        customFooterText: agency.customFooterText,
        customFooterUrl: agency.customFooterUrl,
        supportEmail: agency.supportEmail,
        supportPhone: agency.supportPhone,
      },
    });
  } catch (error: any) {
    console.error('Error fetching public agency brand:', error);
    return NextResponse.json({ error: 'Failed to fetch agency branding' }, { status: 500 });
  }
}
