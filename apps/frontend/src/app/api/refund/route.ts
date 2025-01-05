import Razorpay from "razorpay";
import dotenv from "dotenv";
import { NextRequest, NextResponse } from "next/server";
dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


// async function refundPayment(paymentId, amount)
export async function POST(request: NextRequest) {
    try {
        console.log("Request received",request);
        const { paymentId, amount } = await request.json();
      const refund = await razorpay.payments.refund(paymentId, { amount });
      console.log("Refund successful:", refund);
      return NextResponse.json({ refund }, { status: 200 });
    } catch (error) {
      console.error("Refund failed:", error);
      throw error;
    }
}