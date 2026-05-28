import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  return Response.json(user);
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { currentPassword, newPassword, newEmail, name } = body;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  if (newPassword) {
    if (!currentPassword) {
      return Response.json(
        { error: "Текущий пароль обязателен" },
        { status: 400 }
      );
    }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return Response.json(
        { error: "Неверный текущий пароль" },
        { status: 400 }
      );
    }
  }

  const updateData: Record<string, string> = {};
  if (name !== undefined) updateData.name = name;
  if (newEmail) updateData.email = newEmail;
  if (newPassword) updateData.password = await bcrypt.hash(newPassword, 12);

  if (Object.keys(updateData).length === 0) {
    return Response.json({ error: "Нечего обновлять" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: updateData,
    select: { id: true, email: true, name: true, role: true },
  });

  return Response.json({ success: true, user: updated });
}
