import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user data from Clerk
    const clerkUser = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!clerkUser.ok) {
      const errorText = await clerkUser.text();
      console.error('Clerk API error:', errorText);
      return NextResponse.json({ error: 'Failed to fetch user from Clerk' }, { status: 400 });
    }

    const clerkUserData = await clerkUser.json();
    
    // Extract user information
    const email = clerkUserData.email_addresses?.[0]?.email_address;
    const name = `${clerkUserData.first_name || ''} ${clerkUserData.last_name || ''}`.trim() || null;
    const imageUrl = clerkUserData.image_url;


    if (!email) {
      return NextResponse.json({ error: 'Email not found' }, { status: 400 });
    }

    // Check if user already exists
    // Test database connection
    try {
      await prisma.$connect();
    } catch (error) {
      console.error('Database connection error:', error);
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (existingUser) {
      // Update existing user
      const updatedUser = await prisma.user.update({
        where: { clerkUserId: userId },
        data: {
          email,
          name,
          imageUrl,
          updatedAt: new Date(),
        }
      });

      return NextResponse.json({ 
        message: 'User updated successfully', 
        user: updatedUser 
      });
    } else {
      // Create new user
      const newUser = await prisma.user.create({
        data: {
          clerkUserId: userId,
          email,
          name,
          imageUrl,
        }
      });

      return NextResponse.json({ 
        message: 'User created successfully', 
        user: newUser 
      });
    }

  } catch (error) {
    console.error('Error syncing user:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
