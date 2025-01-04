'use server';
import { auth} from "../../auth"
import { prisma } from "./prisma"

export async function getSubscriptionStatus() {
  // const session = await auth()
  
  // if (!session?.user?.email) {
  //   return false
  // }

//   const subscription = await prisma.subscription.findFirst({
//     where: {
//       user: {
//         email: session.user.email
//       },
//       active: true,
//       endDate: {
//         gt: new Date()
//       }
//     }
//   })
const subscription = {
    plan : "premium"
}


  return subscription?.plan === "premium"
}


export async function createSubscription() {
  const session = await auth();
  const userid = session?.user?.id;

  if (!userid) {
    throw new Error("User is not authenticated.");
  }

  try {
    const result = await prisma.subscription.create({
      data: {
        userId: userid,
        name: "Premium Plan",
        deadline: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Deadline set to 1 month from now
        uploadLimit: 5 * 1024, // 5 GB (in MB)
      },
    });

    return {
      plan: "premium",
      subscriptionId: result.id,
    };
  } catch (error) {
    console.error("Error creating subscription:", error);
    throw new Error("Failed to create subscription.");
  }
}

