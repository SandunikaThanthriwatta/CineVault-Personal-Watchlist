import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if ("watched" in body) {
    data.watched = body.watched;
    data.watchedAt = body.watched ? new Date() : null;
  }
  if ("rating" in body) data.rating = body.rating;

  const item = await prisma.watchlistItem.update({
    where: { id },
    data,
  });
  return NextResponse.json(item);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.watchlistItem.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
