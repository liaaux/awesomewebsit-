"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { login, logout } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function signup(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  if (!email || !password) {
    return { error: "Missing fields" };
  }

  if (!email.endsWith("@schools.vic.edu.au")) {
    return { error: "Email must end with @schools.vic.edu.au" };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "User already exists" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const role = email === "lmamo1@schools.vic.edu.au" ? "ADMIN" : "USER";
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
    });

    await login({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (e) {
    return { error: "Something went wrong" };
  }
  redirect("/");
}

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Missing fields" };
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return { error: "Invalid credentials" };
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return { error: "Invalid credentials" };
  }

  await login({ id: user.id, email: user.email, name: user.name, role: user.role });
  redirect("/");
}

export async function logoutAction() {
  await logout();
  redirect("/login");
}
