import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, userPlanId } = body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !userPlanId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Verify the payment signature
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isSignatureValid = generated_signature === razorpay_signature;

    if (!isSignatureValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Get the payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    
    // Get the user plan
    const userPlan = await prisma.userPlan.findUnique({
      where: { id: userPlanId }
    });

    if (!userPlan) {
      console.error('User plan not found:', userPlanId);
      return NextResponse.json({ error: 'User plan not found' }, { status: 404 });
    }

    // Verify the order ID matches
    if (userPlan.orderId !== razorpay_order_id) {
      console.error('Order ID mismatch:', userPlan.orderId, 'vs', razorpay_order_id);
      return NextResponse.json({ error: 'Order ID mismatch' }, { status: 400 });
    }

    // Handle payment status - if authorized, capture it
    let paymentStatus: 'COMPLETED' | 'FAILED' = 'FAILED';
    
    if (payment.status === 'captured') {
      paymentStatus = 'COMPLETED';
    } else if (payment.status === 'authorized') {
      // Capture the authorized payment
      try {
        await razorpay.payments.capture(razorpay_payment_id, payment.amount, payment.currency);
        paymentStatus = 'COMPLETED';
      } catch (captureError) {
        console.error('Error capturing payment:', captureError);
        paymentStatus = 'FAILED';
      }
    }
    
    // Create UserPlanPayment record
    await prisma.userPlanPayment.create({
      data: {
        userPlanId: userPlan.id,
        orderId: userPlan.orderId,
        paymentId: razorpay_payment_id,
        status: paymentStatus,
        paymentDetails: {
          razorpayPaymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          razorpaySignature: razorpay_signature,
          paymentStatus: paymentStatus === 'COMPLETED' ? 'captured' : payment.status,
          paymentMethod: payment.method,
          paymentAmount: payment.amount,
          paymentCurrency: payment.currency,
          paymentCreatedAt: payment.created_at,
          paymentCapturedAt: paymentStatus === 'COMPLETED' ? new Date().toISOString() : null,
        }
      }
    });

    // If payment is successful, update the user plan status
    if (paymentStatus === 'COMPLETED') {
      await prisma.userPlan.update({
        where: { id: userPlanId },
        data: {
          status: 'ACTIVE'
        }
      });
    } else {
      await prisma.userPlan.update({
        where: { id: userPlanId },
        data: {
          status: 'CANCELLED'
        }
      });
    }

    return NextResponse.json({
      success: true,
      status: paymentStatus,
      message: paymentStatus === 'COMPLETED' ? 'Payment successful' : 'Payment failed'
    });

  } catch (error) {
    console.error('Error processing payment callback:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}
