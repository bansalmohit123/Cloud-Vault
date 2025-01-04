import Razorpay from "razorpay";
import dotenv from "dotenv";
import { NextRequest, NextResponse } from "next/server";
dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    console.log("Request received",request);
    const { amount } = await request.json();
    console.log(amount);
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: "receipt_" + Math.random().toString(36).substring(7),
    });

    return NextResponse.json({ orderId: order.id }, { status: 200 });
  } catch (error) {
    console.log(error);
  }
}

