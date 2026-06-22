import { NextRequest, NextResponse } from "next/server";
import { getMovieDetail } from "@/lib/tmdb";
import type { MediaType } from "@/lib/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const type = (req.nextUrl.searchParams.get("type") ?? "movie") as MediaType;
  try {
    const detail = await getMovieDetail(Number(id), type);
    return NextResponse.json(detail);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
