'use server';
import { auth} from "../../auth"
import { prisma } from "./prisma"

export async function getSubscriptionStatus() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return false
  }

  const subscription = await prisma.subscription.findFirst({
    where: {
      userId: session.user.id,
    }
  })

  if (!subscription) {
    return false
  }
  if(subscription?.deadline !== null && subscription?.deadline < new Date()) {
    return false
  }

  return true
}


export async function createSubscription() {
  const session = await auth();
  console.log("session", session)
  const userid = session?.user?.id;
  console.log("userid", userid)

  if (!userid) {
    throw new Error("User is not authenticated.");
  }

  try {
    const result = await prisma.subscription.create({
      data: {
        userId: userid,
        name: "Premium Plan",
        deadline: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Deadline set to 1 month from now
      },
    });

    return {
      ok : true,
      plan: "premium",
      subscriptionId: result.id,
    };
  } catch (error) {
    console.error("Error creating subscription:", error);
    throw new Error("Failed to create subscription.");
  }
}

export async function SubcriptionModel() {
  const session = await auth();
  const userid = session?.user?.id;

  if (!userid) {
    throw new Error("User is not authenticated.");
  }

  const subscription = await prisma.subscription.findFirst({
    where: {
      userId: userid,
    },
  });

  if (!subscription) {
    return {
      plan: "free",
      subscriptionId: null
  }
}

  return subscription;
}

