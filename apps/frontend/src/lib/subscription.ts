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