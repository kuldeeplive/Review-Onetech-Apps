import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { slugify, getBillingCycleStart, getNextBillingResetDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

// Helper: Ensure request is from Super Admin
async function ensureSuperAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'SUPER_ADMIN') {
    return null;
  }
  return user;
}

// GET /api/super-admin/clients - List all businesses with stats
export async function GET() {
  try {
    const admin = await ensureSuperAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const businesses = await prisma.business.findMany({
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        feedbacks: {
          select: {
            id: true,
            rating: true,
            status: true,
          },
        },
        scans: {
          select: {
            id: true,
            action: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Compute start of current calendar month
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    // Compute global metrics
    const totalClients = businesses.length;
    const activeClients = businesses.filter((b) => b.isActive).length;
    const totalFeedbacks = businesses.reduce((acc, b) => acc + b.feedbacks.length, 0);
    const pendingFeedbacks = businesses.reduce(
      (acc, b) => acc + b.feedbacks.filter((f) => f.status === 'PENDING').length,
      0
    );
    const totalScans = businesses.reduce((acc, b) => acc + b.scans.length, 0);

    const formattedBusinesses = businesses.map((b) => {
      const negativeCount = b.feedbacks.filter((f) => f.rating < b.minPositiveRating).length;
      const positiveCount = b.scans.filter((s) => s.action === 'REDIRECTED_GOOGLE').length;
      const cycleStart = getBillingCycleStart(b.createdAt);
      const scansThisCycle = b.scans.filter((s) => new Date(s.createdAt) >= cycleStart).length;

      return {
        id: b.id,
        name: b.name,
        slug: b.slug,
        category: b.category || 'General Business',
        bio: b.bio || '',
        services: b.services || '',
        ownerId: b.ownerId,
        ownerName: b.owner.name,
        ownerEmail: b.owner.email,
        ownerPhone: b.owner.phone,
        googleReviewUrl: b.googleReviewUrl,
        minPositiveRating: b.minPositiveRating,
        isActive: b.isActive,
        collectFeedbackOnLowRating: b.collectFeedbackOnLowRating,
        issueCategories: b.issueCategories,
        enableDiscountOffer: b.enableDiscountOffer,
        enableAiReview: b.enableAiReview,
        enableServices: b.enableServices,
        enablePositiveTags: b.enablePositiveTags,
        enableLanguageSelection: b.enableLanguageSelection,
        selectedLanguages: b.selectedLanguages,
        positiveTags: b.positiveTags,
        discountOfferTitle: b.discountOfferTitle,
        discountOfferCode: b.discountOfferCode,
        discountOfferText: b.discountOfferText,
        standeeTemplate: b.standeeTemplate,
        standeeTagline: b.standeeTagline,
        planName: b.planName,
        planPrice: b.planPrice,
        planExpiresAt: b.planExpiresAt,
        monthlyScanLimit: b.monthlyScanLimit ?? 500,
        scansThisMonth: scansThisCycle,
        cycleResetDate: getNextBillingResetDate(b.createdAt),
        primaryColor: b.primaryColor,
        positiveMessage: b.positiveMessage,
        negativeMessage: b.negativeMessage,
        totalScans: b.scans.length,
        totalFeedbacks: b.feedbacks.length,
        pendingFeedbacks: b.feedbacks.filter((f) => f.status === 'PENDING').length,
        positiveRedirects: positiveCount,
        negativeFeedbacks: negativeCount,
        createdAt: b.createdAt,
      };
    });

    return NextResponse.json({
      metrics: {
        totalClients,
        activeClients,
        inactiveClients: totalClients - activeClients,
        totalScans,
        totalFeedbacks,
        pendingFeedbacks,
      },
      clients: formattedBusinesses,
    });
  } catch (error: any) {
    console.error('Fetch clients error:', error);
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}

// POST /api/super-admin/clients - Create new client & business
export async function POST(req: Request) {
  try {
    const admin = await ensureSuperAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const {
      ownerName,
      ownerEmail,
      ownerPassword,
      ownerPhone,
      businessName,
      customSlug,
      googleReviewUrl,
      minPositiveRating = 4,
      collectFeedbackOnLowRating = true,
      issueCategories = 'Service Speed, Product Quality, Staff Behavior, Cleanliness & Hygiene, Pricing / Billing, Other Issue',
      enableDiscountOffer = true,
      enableAiReview = true,
      positiveTags = 'Fast & Friendly, Top Quality, Great Hospitality, Value for Money, Highly Recommended',
      standeeTemplate = 'modern_gradient',
      standeeTagline = 'Loved your visit? Share your feedback!',
      planName = 'Pro Plan',
      planPrice = '₹999/mo',
      durationDays = 365,
      monthlyScanLimit = 500,
      notificationPhone,
      notificationEmail,
    } = body;

    if (!ownerEmail || !ownerPassword || !businessName) {
      return NextResponse.json(
        { error: 'Owner Email, Password, and Business Name are required.' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: ownerEmail.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists.' },
        { status: 400 }
      );
    }

    // Calculate unique slug
    let finalSlug = slugify(customSlug || businessName);
    const existingSlug = await prisma.business.findUnique({
      where: { slug: finalSlug },
    });

    if (existingSlug) {
      finalSlug = `${finalSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(ownerPassword, 10);

    // Calculate plan expiry date
    const planExpiresAt = durationDays > 0 ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000) : null;

    // Create User & Business in transaction
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: ownerName || businessName,
          email: ownerEmail.toLowerCase().trim(),
          password: hashedPassword,
          role: 'BUSINESS_OWNER',
          phone: ownerPhone || null,
        },
      });

      const newBusiness = await tx.business.create({
        data: {
          ownerId: newUser.id,
          name: businessName,
          slug: finalSlug,
          category: body.category || 'General Business',
          bio: body.bio || null,
          services: body.services || 'Custom Web Development, Mobile Apps, UI/UX Design, Cloud Solutions',
          googleReviewUrl: googleReviewUrl || 'https://maps.google.com',
          minPositiveRating: Number(minPositiveRating) || 4,
          collectFeedbackOnLowRating: Boolean(collectFeedbackOnLowRating),
          issueCategories: issueCategories,
          enableDiscountOffer: Boolean(enableDiscountOffer),
          enableAiReview: Boolean(enableAiReview),
          enableServices: body.enableServices !== undefined ? Boolean(body.enableServices) : true,
          enablePositiveTags: body.enablePositiveTags !== undefined ? Boolean(body.enablePositiveTags) : true,
          enableLanguageSelection: body.enableLanguageSelection !== undefined ? Boolean(body.enableLanguageSelection) : true,
          selectedLanguages: body.selectedLanguages || 'English, Hinglish, Hindi, Gujarati, Marathi, Punjabi, Bengali, Tamil, Telugu, Arabic, Spanish',
          positiveTags: positiveTags,
          standeeTemplate: standeeTemplate || 'modern_gradient',
          standeeTagline: standeeTagline || 'Loved your visit? Share your feedback!',
          isActive: true,
          planName: planName,
          planPrice: planPrice,
          planExpiresAt: planExpiresAt,
          monthlyScanLimit: Number(monthlyScanLimit) !== undefined ? Number(monthlyScanLimit) : 500,
          notificationPhone: notificationPhone || ownerPhone || null,
          notificationEmail: notificationEmail || ownerEmail || null,
        },
      });

      // Record initial transaction
      await tx.subscriptionTransaction.create({
        data: {
          businessId: newBusiness.id,
          planName: planName || 'Pro Plan',
          amount: planPrice || '₹999/mo',
          durationDays: Number(durationDays) || 365,
          status: 'PAID',
          paymentMethod: 'DIRECT_ADMIN',
          notes: 'Initial Plan Onboarding',
        },
      });

      return { user: newUser, business: newBusiness };
    });

    return NextResponse.json({
      success: true,
      message: 'Client onboarded successfully!',
      client: {
        id: result.business.id,
        name: result.business.name,
        slug: result.business.slug,
        ownerEmail: result.user.email,
        minPositiveRating: result.business.minPositiveRating,
        planName: result.business.planName,
      },
    });
  } catch (error: any) {
    console.error('Create client error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create client' }, { status: 500 });
  }
}

// PATCH /api/super-admin/clients - Toggle active status, extend plan or edit all client settings
export async function PATCH(req: Request) {
  try {
    const admin = await ensureSuperAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const {
      businessId,
      action,
      isActive,
      extendDays,
      minPositiveRating,
      collectFeedbackOnLowRating,
      issueCategories,
      enableDiscountOffer,
      enableAiReview,
      positiveTags,
      discountOfferTitle,
      discountOfferCode,
      discountOfferText,
      standeeTemplate,
      standeeTagline,
      googleReviewUrl,
      name,
      primaryColor,
      planName,
      planPrice,
      planExpiresAt,
      monthlyScanLimit,
      positiveMessage,
      negativeMessage,
      notificationPhone,
      notificationEmail,
    } = body;

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 });
    }

    const currentBusiness = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!currentBusiness) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Handle toggle active/inactive
    if (action === 'TOGGLE_STATUS' || typeof isActive === 'boolean') {
      const updated = await prisma.business.update({
        where: { id: businessId },
        data: { isActive: typeof isActive === 'boolean' ? isActive : !currentBusiness.isActive },
      });
      return NextResponse.json({
        success: true,
        message: `Business status updated to ${updated.isActive ? 'Active' : 'Inactive'}`,
        isActive: updated.isActive,
      });
    }

    // Handle extend subscription
    if (action === 'EXTEND_PLAN' && extendDays) {
      const currentExpiry = currentBusiness.planExpiresAt ? new Date(currentBusiness.planExpiresAt) : new Date();
      const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
      const newExpiry = new Date(baseDate.getTime() + Number(extendDays) * 24 * 60 * 60 * 1000);

      const updated = await prisma.business.update({
        where: { id: businessId },
        data: { planExpiresAt: newExpiry, isActive: true },
      });

      // Record transaction
      await prisma.subscriptionTransaction.create({
        data: {
          businessId: currentBusiness.id,
          planName: currentBusiness.planName || 'Plan Extended',
          amount: currentBusiness.planPrice || 'Extension',
          durationDays: Number(extendDays),
          status: 'EXTENDED',
          paymentMethod: 'DIRECT_ADMIN',
          notes: `Subscription extended by ${extendDays} days by Super Admin`,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Plan extended by ${extendDays} days`,
        planExpiresAt: updated.planExpiresAt,
      });
    }

    // Handle full client update
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.services !== undefined) updateData.services = body.services;
    if (googleReviewUrl !== undefined) updateData.googleReviewUrl = googleReviewUrl;
    if (minPositiveRating !== undefined) updateData.minPositiveRating = Number(minPositiveRating);
    if (collectFeedbackOnLowRating !== undefined) updateData.collectFeedbackOnLowRating = Boolean(collectFeedbackOnLowRating);
    if (issueCategories !== undefined) updateData.issueCategories = issueCategories;
    if (enableDiscountOffer !== undefined) updateData.enableDiscountOffer = Boolean(enableDiscountOffer);
    if (enableAiReview !== undefined) updateData.enableAiReview = Boolean(enableAiReview);
    if (body.enableServices !== undefined) updateData.enableServices = Boolean(body.enableServices);
    if (body.enablePositiveTags !== undefined) updateData.enablePositiveTags = Boolean(body.enablePositiveTags);
    if (body.enableLanguageSelection !== undefined) updateData.enableLanguageSelection = Boolean(body.enableLanguageSelection);
    if (body.selectedLanguages !== undefined) updateData.selectedLanguages = body.selectedLanguages;
    if (positiveTags !== undefined) updateData.positiveTags = positiveTags;
    if (discountOfferTitle !== undefined) updateData.discountOfferTitle = discountOfferTitle;
    if (discountOfferCode !== undefined) updateData.discountOfferCode = discountOfferCode;
    if (discountOfferText !== undefined) updateData.discountOfferText = discountOfferText;
    if (standeeTemplate !== undefined) updateData.standeeTemplate = standeeTemplate;
    if (standeeTagline !== undefined) updateData.standeeTagline = standeeTagline;
    if (primaryColor !== undefined) updateData.primaryColor = primaryColor;
    if (planName !== undefined) updateData.planName = planName;
    if (planPrice !== undefined) updateData.planPrice = planPrice;
    if (planExpiresAt !== undefined) updateData.planExpiresAt = planExpiresAt ? new Date(planExpiresAt) : null;
    if (monthlyScanLimit !== undefined) updateData.monthlyScanLimit = Number(monthlyScanLimit);
    if (positiveMessage !== undefined) updateData.positiveMessage = positiveMessage;
    if (negativeMessage !== undefined) updateData.negativeMessage = negativeMessage;
    if (notificationPhone !== undefined) updateData.notificationPhone = notificationPhone;
    if (notificationEmail !== undefined) updateData.notificationEmail = notificationEmail;

    const updated = await prisma.business.update({
      where: { id: businessId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Business details & settings updated successfully',
      business: updated,
    });
  } catch (error: any) {
    console.error('Update client error:', error);
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
  }
}

// DELETE /api/super-admin/clients - Delete business and user
export async function DELETE(req: Request) {
  try {
    const admin = await ensureSuperAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 });
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Delete the owner user (Cascade will delete business, feedbacks, scans)
    await prisma.user.delete({
      where: { id: business.ownerId },
    });

    return NextResponse.json({
      success: true,
      message: `Business "${business.name}" deleted successfully.`,
    });
  } catch (error: any) {
    console.error('Delete client error:', error);
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
  }
}
