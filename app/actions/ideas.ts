"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createIdea(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.isBanned) return { error: "Your account is banned from posting" };

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const suggestedDate = formData.get("suggestedDate") as string;
  const suggestedLocation = formData.get("suggestedLocation") as string;
  const monetaryRequirement = formData.get("monetaryRequirement") as string;

  if (!title || !description) {
    return { error: "Title and description are required" };
  }

  try {
    await prisma.idea.create({
      data: {
        title,
        description,
        suggestedDate,
        suggestedLocation,
        monetaryRequirement,
        authorId: session.user.id,
      },
    });
  } catch (e) {
    return { error: "Failed to create idea" };
  }

  revalidatePath("/");
  redirect("/");
}

export async function toggleUpvote(ideaId: string) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.isBanned) return { error: "Your account is banned from voting" };

  const userId = session.user.id;

  const existingUpvote = await prisma.upvote.findUnique({
    where: {
      userId_ideaId: {
        userId,
        ideaId,
      },
    },
  });

  if (existingUpvote) {
    await prisma.upvote.delete({
      where: {
        userId_ideaId: {
          userId,
          ideaId,
        },
      },
    });
  } else {
    await prisma.upvote.create({
      data: {
        userId,
        ideaId,
      },
    });
  }

  revalidatePath("/");
  revalidatePath(`/ideas/${ideaId}`);
}
