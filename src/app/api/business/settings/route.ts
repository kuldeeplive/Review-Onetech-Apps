import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !user.businessId) {
      return NextResponse.json({ error: 'Unauthorized or no business linked' }, { status: 401 });
    }

    const business = await prisma.business.findUnique({
      where: { id: user.businessId },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    return NextResponse.json({ business });
  } catch (error: any) {
    console.error('Fetch business settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.businessId) {
      return NextResponse.json({ error: 'Unauthorized or no business linked' }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      googleReviewUrl,
      minPositiveRating,
      collectFeedbackOnLowRating,
      issueCategories,
      enableDiscountOffer,
      enableAiReview,
      positiveTags,
      standeeTemplate,
      standeeTagline,
      primaryColor,
      logoUrl,
      notificationPhone,
      notificationEmail,
      whatsappAlertEnabled,
      discountOfferTitle,
      discountOfferCode,
      discountOfferText,
      positiveMessage,
      negativeMessage,
    } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.bio !== undefined) updateData.bio = body.bio;
    if (googleReviewUrl !== undefined) updateData.googleReviewUrl = googleReviewUrl;
    if (minPositiveRating !== undefined) updateData.minPositiveRating = Number(minPositiveRating);
    if (collectFeedbackOnLowRating !== undefined) updateData.collectFeedbackOnLowRating = Boolean(collectFeedbackOnLowRating);
    if (issueCategories !== undefined) updateData.issueCategories = issueCategories;
    if (enableDiscountOffer !== undefined) updateData.enableDiscountOffer = Boolean(enableDiscountOffer);
    if (enableAiReview !== undefined) updateData.enableAiReview = Boolean(enableAiReview);
    if (positiveTags !== undefined) updateData.positiveTags = positiveTags;
    if (standeeTemplate !== undefined) updateData.standeeTemplate = standeeTemplate;
    if (standeeTagline !== undefined) updateData.standeeTagline = standeeTagline;
    if (primaryColor !== undefined) updateData.primaryColor = primaryColor;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
    if (notificationPhone !== undefined) updateData.notificationPhone = notificationPhone;
    if (notificationEmail !== undefined) updateData.notificationEmail = notificationEmail;
    if (whatsappAlertEnabled !== undefined) updateData.whatsappAlertEnabled = Boolean(whatsappAlertEnabled);
    if (discountOfferTitle !== undefined) updateData.discountOfferTitle = discountOfferTitle;
    if (discountOfferCode !== undefined) updateData.discountOfferCode = discountOfferCode;
    if (discountOfferText !== undefined) updateData.discountOfferText = discountOfferText;
    if (positiveMessage !== undefined) updateData.positiveMessage = positiveMessage;
    if (negativeMessage !== undefined) updateData.negativeMessage = negativeMessage;

    const updated = await prisma.business.update({
      where: { id: user.businessId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Business settings updated successfully!',
      business: updated,
    });
  } catch (error: any) {
    console.error('Update business settings error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
