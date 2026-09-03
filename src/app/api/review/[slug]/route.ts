import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getBillingCycleStart, getNextBillingResetDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;

    const business = await prisma.business.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        bio: true,
        services: true,
        logoUrl: true,
        bannerUrl: true,
        primaryColor: true,
        googleReviewUrl: true,
        minPositiveRating: true,
        isActive: true,
        collectFeedbackOnLowRating: true,
        issueCategories: true,
        enableDiscountOffer: true,
        enableAiReview: true,
        enableServices: true,
        enablePositiveTags: true,
        enableLanguageSelection: true,
        selectedLanguages: true,
        positiveTags: true,
        discountOfferTitle: true,
        discountOfferCode: true,
        discountOfferText: true,
        positiveMessage: true,
        negativeMessage: true,
        monthlyScanLimit: true,
        planExpiresAt: true,
        createdAt: true,
        agency: {
          select: {
            name: true,
            brandName: true,
            customFooterText: true,
            customFooterUrl: true,
            themeColor: true,
            logoUrl: true,
            isActive: true,
          },
        },
      },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const isExpired = business.planExpiresAt ? new Date(business.planExpiresAt) < new Date() : false;
    if (!business.isActive || isExpired) {
      return NextResponse.json(
        {
          error: isExpired
            ? 'This business subscription plan has expired. Please contact the administrator to renew.'
            : 'This business review portal is currently inactive or under maintenance.',
          isActive: false,
          isExpired,
        },
        { status: 403 }
      );
    }

    // Check Billing Cycle Scan Limit (Date-to-Date based on subscription start)
    const cycleStart = getBillingCycleStart(business.createdAt);
    const scansThisCycle = await prisma.scanAnalytics.count({
      where: {
        businessId: business.id,
        createdAt: { gte: cycleStart },
      },
    });

    const limit = business.monthlyScanLimit ?? 500;
    if (limit !== -1 && scansThisCycle >= limit) {
      return NextResponse.json(
        {
          error: 'This business review portal has reached its monthly scan limit for the current billing cycle.',
          quotaExceeded: true,
          businessName: business.name,
        },
        { status: 429 }
      );
    }

    // Log page view in background
    try {
      const userAgent = req.headers.get('user-agent') || 'unknown';
      await prisma.scanAnalytics.create({
        data: {
          businessId: business.id,
          action: 'PAGE_VIEW',
          userAgent,
        },
      });
    } catch (e) {
      // Non-blocking
    }

    return NextResponse.json({
      business,
      usage: {
        scansThisMonth: scansThisCycle,
        monthlyScanLimit: limit,
        cycleResetDate: getNextBillingResetDate(business.createdAt),
      },
    });
  } catch (error: any) {
    console.error('Fetch public business error:', error);
    return NextResponse.json({ error: 'Failed to load review page' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const body = await req.json();
    const {
      rating,
      customerName,
      customerPhone,
      customerEmail,
      issueCategory,
      comment,
      skipFeedback,
    } = body;

    const business = await prisma.business.findUnique({
      where: { slug },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    if (!business.isActive) {
      return NextResponse.json({ error: 'Business is inactive' }, { status: 403 });
    }

    const starRating = Number(rating);
    const isPositive = starRating >= business.minPositiveRating;
    const userAgent = req.headers.get('user-agent') || 'unknown';

    if (isPositive) {
      // 1. High rating flow: Log scan & provide Google URL
      await prisma.scanAnalytics.create({
        data: {
          businessId: business.id,
          ratingSelected: starRating,
          action: 'REDIRECTED_GOOGLE',
          userAgent,
        },
      });

      return NextResponse.json({
        success: true,
        action: 'REDIRECT',
        googleReviewUrl: business.googleReviewUrl,
        message: business.positiveMessage,
      });
    } else {
      // 2. Low rating flow: Check if data collection is disabled or skipped
      if (!business.collectFeedbackOnLowRating || skipFeedback) {
        await prisma.scanAnalytics.create({
          data: {
            businessId: business.id,
            ratingSelected: starRating,
            action: 'LOW_RATING_NO_FEEDBACK',
            userAgent,
          },
        });

        return NextResponse.json({
          success: true,
          action: 'LOW_RATING_NO_FEEDBACK',
          enableDiscountOffer: business.enableDiscountOffer,
          discountOffer: business.enableDiscountOffer
            ? {
                title: business.discountOfferTitle,
                code: business.discountOfferCode,
                text: business.discountOfferText,
              }
            : null,
          message: business.negativeMessage || 'Thank you for your rating. We will work to improve our service.',
        });
      }

      // If data collection is enabled and comment provided
      if (!comment) {
        return NextResponse.json(
          { error: 'Please let us know your feedback to help us improve.' },
          { status: 400 }
        );
      }

      const feedback = await prisma.feedback.create({
        data: {
          businessId: business.id,
          rating: starRating,
          customerName: customerName || 'Anonymous Customer',
          customerPhone: customerPhone || null,
          customerEmail: customerEmail || null,
          issueCategory: issueCategory || 'General Feedback',
          comment: comment.trim(),
          status: 'PENDING',
        },
      });

      await prisma.scanAnalytics.create({
        data: {
          businessId: business.id,
          ratingSelected: starRating,
          action: 'SUBMITTED_FEEDBACK',
          userAgent,
        },
      });

      return NextResponse.json({
        success: true,
        action: 'FEEDBACK_CAPTURED',
        feedbackId: feedback.id,
        enableDiscountOffer: business.enableDiscountOffer,
        discountOffer: business.enableDiscountOffer
          ? {
              title: business.discountOfferTitle,
              code: business.discountOfferCode,
              text: business.discountOfferText,
            }
          : null,
      });
    }
  } catch (error: any) {
    console.error('Submit review error:', error);
    return NextResponse.json({ error: 'Failed to process feedback' }, { status: 500 });
  }
}
