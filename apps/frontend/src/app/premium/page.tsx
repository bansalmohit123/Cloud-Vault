"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSubscription } from "@/components/subscription-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { createSubscription } from "@/lib/subscription";
import { redirect } from "next/navigation";
import { useToast } from "@/hooks/use-toast";


declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PremiumPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { isPremium, setIsPremium } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const { toast } = useToast();

  // Ensure Razorpay script is loaded
  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
      script.onload = () => console.log("Razorpay script loaded successfully");
      script.onerror = () => console.error("Failed to load Razorpay script");
    }
  }, []);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const response = await createSubscription();
      console.log("response", response)
      if (!response) {
        toast({ title: "Error", description: "Money have been deducted but failed in updating db, please contact support asap!, " });
        return;
      }
      toast({ title: "Success", description: "Subscription created successfully" });
      setIsPremium(true);
      router.push("/");
    } catch (error) {
      toast({ title: "Error", description: "Money have been deducted but failed in updating db, please contact support asap!, " });
      console.error(error);
    }
    setLoading(false);
  };

  const handlePayment = async () => {
    setPaymentLoading(true);
    try {
      const response = await fetch("/api/createOrder", {
        method: "POST",
        body: JSON.stringify({ amount: 299 * 100 }), // Amount in paisa
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
  
      // Check if Razorpay object is available
      if (!window.Razorpay) {
        throw new Error("Razorpay SDK not loaded");
      }
  
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: "INR",
        name: "CloudDrive",
        description: "Premium Subscription",
        order_id: data.orderId,
        handler: async (paymentResponse: any) => {
          try {
            console.log("Payment successful", paymentResponse);
            
            // Only update subscription status in the database after successful payment
            await handleSubscribe();
            toast({ title: "Success", description: "Payment successful, subscription updated!" });
          } catch (error) {
            toast({ title: "Error", description: "Failed to update subscription after payment." });
            console.error(error);
          }
        },
        prefill: {
          name: session?.user?.name || "Your Name",
          email: session?.user?.email || "youremail@example.com",
        },
        theme: {
          color: "#3399cc",
        },
      };
  
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast({ title: "Error", description: "Failed to create payment" });
      console.error(error);
    } finally {
      setPaymentLoading(false);
    }
  };
  

  if (isPremium) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              You're a Premium Member!
            </CardTitle>
            <CardDescription className="text-center text-lg">
              Enjoy all the premium features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center text-green-600">
                <Check className="mr-2" /> Unlimited storage
              </li>
              <li className="flex items-center text-green-600">
                <Check className="mr-2" /> Priority support
              </li>
              <li className="flex items-center text-green-600">
                <Check className="mr-2" /> Advanced file sharing
              </li>
              <li className="flex items-center text-green-600">
                <Check className="mr-2" /> Team collaboration
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Choose Your Plan</h1>
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Free Plan</CardTitle>
              <CardDescription>Basic features for personal use</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="mr-2 text-green-600" /> 1GB storage
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 text-green-600" /> Basic file sharing
                </li>
                <li className="flex items-center">
                  <X className="mr-2 text-red-600" /> Priority support
                </li>
                <li className="flex items-center">
                  <X className="mr-2 text-red-600" /> Team collaboration
                </li>
              </ul>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-2xl font-bold text-center w-full">FREE</div>
              <Button variant="outline" className="w-full">
                Current Plan
              </Button>
            </CardFooter>
          </Card>
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle>Premium Plan</CardTitle>
              <CardDescription>Advanced features for power users</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="mr-2 text-green-600" /> Unlimited storage
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 text-green-600" /> Advanced file sharing
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 text-green-600" /> Priority support
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 text-green-600" /> Team collaboration
                </li>
              </ul>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-2xl font-bold text-center w-full">
                299INR/month
              </div>
              <Button
                onClick={handlePayment}
                disabled={paymentLoading || loading || !session}
                className="w-full"
              >
                {paymentLoading
                  ? "Processing Payment..."
                  : loading
                  ? "Upgrading..."
                  : "Upgrade Now"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}