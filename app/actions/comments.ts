"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createComment(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.isBanned) return { error: "Your account is banned from commenting" };

  const content = formData.get("content") as string;
  const ideaId = formData.get("ideaId") as string;

  if (!content || !ideaId) {
    return { error: "Content is required" };
  }

  try {
    await prisma.comment.create({
      data: {
        content,
        ideaId,
        authorId: session.user.id,
      },
    });
  } catch (e) {
    return { error: "Failed to post comment" };
  }

  revalidatePath(`/ideas/${ideaId}`);
  revalidatePath("/");
}

export async function updateComment(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.isBanned) return { error: "Your account is banned from editing comments" };

  const commentId = formData.get("commentId") as string;
  const content = formData.get("content") as string;

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment || comment.authorId !== session.user.id) {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.comment.update({
      where: { id: commentId },
      data: { content },
    });
  } catch (e) {
    return { error: "Failed to update comment" };
  }

  revalidatePath(`/ideas/${comment.ideaId}`);
}
