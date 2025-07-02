import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { account } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { githubApp } from '@/lib/github/app';

/**
 * Link GitHub App Installation to User Account
 * 
 * This endpoint allows authenticated users to link a GitHub App installation
 * to their account, enabling enhanced repository access and webhook functionality.
 */

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in first.' },
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { installationId } = body;

    if (!installationId || typeof installationId !== 'number') {
      return NextResponse.json(
        { error: 'Valid installation ID is required.' },
        { status: 400 }
      );
    }

    console.log(`🔗 Linking installation ${installationId} to user ${session.user.id}`);

    // Verify the installation exists and is accessible
    try {
      const installation = await githubApp.octokit.request(
        'GET /app/installations/{installation_id}',
        {
          installation_id: installationId,
        }
      );

      console.log(`✅ Installation ${installationId} verified for account: ${installation.data.account?.login}`);
    } catch (error: unknown) {
      const e = error as { status?: number; message?: string };
      console.error(`❌ Installation ${installationId} verification failed:`, e.message);
      
      if (e.status === 404) {
        return NextResponse.json(
          { error: 'Installation not found or not accessible.' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to verify installation. Please try again.' },
        { status: 500 }
      );
    }

    // Check if installation is already linked to another user
    const existingLink = await db.query.account.findFirst({
      where: and(
        eq(account.installationId, installationId),
        eq(account.providerId, 'github')
      ),
    });

    if (existingLink && existingLink.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'This installation is already linked to another user.' },
        { status: 409 }
      );
    }

    // Find the user's GitHub account record
    const userAccount = await db.query.account.findFirst({
      where: and(
        eq(account.userId, session.user.id),
        eq(account.providerId, 'github')
      ),
    });

    if (!userAccount) {
      return NextResponse.json(
        { error: 'GitHub account not found. Please sign in with GitHub first.' },
        { status: 404 }
      );
    }

    // Update the account with the installation ID
    await db.update(account)
      .set({ 
        installationId: installationId,
        updatedAt: new Date()
      })
      .where(and(
        eq(account.userId, session.user.id),
        eq(account.providerId, 'github')
      ));

    console.log(`✅ Successfully linked installation ${installationId} to user ${session.user.id}`);

    return NextResponse.json({
      success: true,
      message: 'GitHub App installation linked successfully.',
      installationId: installationId,
    });

  } catch (error: unknown) {
    console.error('❌ Error linking installation:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in first.' },
        { status: 401 }
      );
    }

    // Find the user's GitHub account record
    const userAccount = await db.query.account.findFirst({
      where: and(
        eq(account.userId, session.user.id),
        eq(account.providerId, 'github')
      ),
    });

    if (!userAccount) {
      return NextResponse.json({
        linked: false,
        installationId: null,
        message: 'No GitHub account found. Please sign in with GitHub first.',
      });
    }

    if (!userAccount.installationId) {
      return NextResponse.json({
        linked: false,
        installationId: null,
        message: 'No GitHub App installation linked to your account.',
      });
    }

    // Verify the installation is still valid
    try {
      const installation = await githubApp.octokit.request(
        'GET /app/installations/{installation_id}',
        {
          installation_id: userAccount.installationId,
        }
      );

      return NextResponse.json({
        linked: true,
        installationId: userAccount.installationId,
        accountLogin: installation.data.account?.login,
        accountType: installation.data.account?.type,
        message: 'GitHub App installation is linked and active.',
      });

    } catch (error: unknown) {
      console.error(`❌ Installation ${userAccount.installationId} is no longer valid:`, error);
      
      // Clear the invalid installation
      await db.update(account)
        .set({ 
          installationId: null,
          updatedAt: new Date()
        })
        .where(and(
          eq(account.userId, session.user.id),
          eq(account.providerId, 'github')
        ));

      return NextResponse.json({
        linked: false,
        installationId: null,
        message: 'GitHub App installation is no longer valid. Please reinstall the app.',
      });
    }

  } catch (error: unknown) {
    console.error('❌ Error checking installation status:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get the authenticated session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in first.' },
        { status: 401 }
      );
    }

    // Remove the installation link from the user's account
    await db.update(account)
      .set({ 
        installationId: null,
        updatedAt: new Date()
      })
      .where(and(
        eq(account.userId, session.user.id),
        eq(account.providerId, 'github')
      ));

    console.log(`✅ Successfully unlinked installation from user ${session.user.id}`);

    return NextResponse.json({
      success: true,
      message: 'GitHub App installation unlinked successfully.',
    });

  } catch (error: unknown) {
    console.error('❌ Error unlinking installation:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

