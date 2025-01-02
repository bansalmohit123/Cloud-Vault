import {auth} from "../../../../auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { sourceId, targetPath } = await request.json()

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Find target folder
    let targetFolder = null
    if (targetPath.length > 0) {
      let currentFolder = null
      for (const segment of targetPath) {
        currentFolder = await prisma.folder.findFirst({
          where: {
            name: segment,
            ownerId: user.id,
            parentId: currentFolder?.id || null
          }
        })
      }
      targetFolder = currentFolder
    }

    // Update the item's parent
    const [file, folder] = await Promise.all([
      prisma.file.findFirst({
        where: { id: sourceId, ownerId: user.id }
      }),
      prisma.folder.findFirst({
        where: { id: sourceId, ownerId: user.id }
      })
    ])

    if (file) {
      await prisma.file.update({
        where: { id: sourceId },
        data: { folderId: targetFolder?.id || null }
      })
    } else if (folder) {
      // Prevent moving a folder into itself or its descendants
      let current = targetFolder
      while (current) {
        if (current.id === sourceId) {
          return new NextResponse(
            "Cannot move a folder into itself or its descendants",
            { status: 400 }
          )
        }
        current = await prisma.folder.findUnique({
          where: { id: current.parentId || "" }
        })
      }

      await prisma.folder.update({
        where: { id: sourceId },
        data: { parentId: targetFolder?.id || null }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}