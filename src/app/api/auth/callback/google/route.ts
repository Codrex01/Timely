import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(new URL(`/?oauth_error=${encodeURIComponent(error)}`, request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/?oauth_error=no_code_provided', request.url));
    }

    const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback/google`;

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    const { tokens } = await oauth2Client.getToken(code);

    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const email = userInfo.data.email || 'user@campus.edu';
    const name = userInfo.data.name || 'Campus Student';

    const cookieStore = cookies();
    if (tokens.access_token) {
      cookieStore.set('gmail_access_token', tokens.access_token, {
        httpOnly: true,
        path: '/',
        maxAge: 3600,
        sameSite: 'lax',
      });
    }

    if (tokens.refresh_token) {
      cookieStore.set('gmail_refresh_token', tokens.refresh_token, {
        httpOnly: true,
        path: '/',
        maxAge: 30 * 24 * 3600,
        sameSite: 'lax',
      });
    }

    cookieStore.set('gmail_user_email', email, {
      httpOnly: false,
      path: '/',
      maxAge: 30 * 24 * 3600,
      sameSite: 'lax',
    });

    const student = await prisma.student.findFirst();
    if (student) {
      await prisma.student.update({
        where: { id: student.id },
        data: { email: email, name: student.name || name },
      });
    }

    return NextResponse.redirect(new URL('/?gmail_connected=true', request.url));
  } catch (err: any) {
    console.error('Error in Google OAuth callback:', err);
    return NextResponse.redirect(
      new URL(`/?oauth_error=${encodeURIComponent(err.message || 'auth_failed')}`, request.url)
    );
  }
}
