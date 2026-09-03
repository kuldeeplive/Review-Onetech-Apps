import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    // Fetch full fresh business info if attached
    let businessDetails = null;
    if (user.businessId) {
      businessDetails = await prisma.business.findUnique({
        where: { id: user.businessId },
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          primaryColor: true,
          googleReviewUrl: true,
          minPositiveRating: true,
          isActive: true,
          planName: true,
          planExpiresAt: true,
          notificationEmail: true,
          notificationPhone: true,
          whatsappAlertEnabled: true,
          discountOfferTitle: true,
          discountOfferCode: true,
          discountOfferText: true,
          positiveMessage: true,
          negativeMessage: true,
        },
      });
    }

    // Fetch full fresh agency info if agency owner
    let agencyDetails = null;
    if (user.agencyId) {
      agencyDetails = await prisma.agency.findUnique({
        where: { id: user.agencyId },
        select: {
          id: true,
          name: true,
          slug: true,
          walletBalance: true,
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
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        ...user,
        business: businessDetails,
        agency: agencyDetails,
      },
    });
  } catch (error: any) {
    console.error('Me endpoint error:', error);
    return NextResponse.json({ authenticated: false, error: 'Failed to verify session' }, { status: 500 });
  }
}
