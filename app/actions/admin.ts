"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function checkAdmin() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

export async function deleteIdea(ideaId: string) {
  await checkAdmin();

  // Delete associated upvotes and comments first due to constraints
  await prisma.upvote.deleteMany({ where: { ideaId } });
  await prisma.comment.deleteMany({ where: { ideaId } });
  await prisma.idea.delete({ where: { id: ideaId } });

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteComment(commentId: string) {
  await checkAdmin();
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) return;

  await prisma.comment.delete({ where: { id: commentId } });

  revalidatePath(`/ideas/${comment.ideaId}`);
  revalidatePath("/admin");
}

export async function togglePinIdea(ideaId: string) {
  await checkAdmin();
  const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
  if (!idea) return;

  await prisma.idea.update({
    where: { id: ideaId },
    data: { isPinned: !idea.isPinned },
  });

  revalidatePath("/");
  revalidatePath(`/ideas/${ideaId}`);
  revalidatePath("/admin");
}

export async function toggleBanUser(userId: string) {
  await checkAdmin();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role === "ADMIN") return; // Cannot ban admins

  await prisma.user.update({
    where: { id: userId },
    data: { isBanned: !user.isBanned },
  });

  revalidatePath("/admin");
}
