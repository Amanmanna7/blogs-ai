import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      throw new Error('Please add CLERK_WEBHOOK_SECRET to .env.local');
    }

    // Get the headers
    const headerPayload = request.headers;
    const svix_id = headerPayload.get('svix-id');
    const svix_timestamp = headerPayload.get('svix-timestamp');
    const svix_signature = headerPayload.get('svix-signature');

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response('Error occured -- no svix headers', {
        status: 400,
      });
    }

    // Get the body
    const payload = await request.json();
    const body = JSON.stringify(payload);

    // Create a new Svix instance with your secret.
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: any;

    // Verify the payload with the headers
    try {
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      });
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return new Response('Error occured', {
        status: 400,
      });
    }

    // Handle the webhook
    const eventType = evt.type;

    if (eventType === 'user.created' || eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;

      const email = email_addresses?.[0]?.email_address;
      const name = `${first_name || ''} ${last_name || ''}`.trim() || null;

      if (!email) {
        return NextResponse.json({ error: 'Email not found' }, { status: 400 });
      }

      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { clerkUserId: id }
        });

        if (existingUser) {
          // Update existing user
          await prisma.user.update({
            where: { clerkUserId: id },
            data: {
              email,
              name,
              imageUrl: image_url,
              updatedAt: new Date(),
            }
          });
        } else {
          // Create new user
          await prisma.user.create({
            data: {
              clerkUserId: id,
              email,
              name,
              imageUrl: image_url,
            }
          });
        }

        return NextResponse.json({ message: 'User synced successfully' });
      } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }
    }

    if (eventType === 'user.deleted') {
      const { id } = evt.data;

      try {
        // Delete user from database
        await prisma.user.delete({
          where: { clerkUserId: id }
        });

        return NextResponse.json({ message: 'User deleted successfully' });
      } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }
    }

    return NextResponse.json({ message: 'Webhook received' });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
