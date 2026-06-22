import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.watchlistItem.findMany({
    orderBy: { addedAt: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    tmdbId, title, posterPath, backdropPath,
    mediaType, overview, genres, voteAverage, releaseDate,
  } = body;

  const item = await prisma.watchlistItem.upsert({
    where: { tmdbId },
    update: {},
    create: {
      tmdbId,
      title,
      posterPath: posterPath ?? null,
      backdropPath: backdropPath ?? null,
      mediaType: mediaType ?? "movie",
      overview: overview ?? null,
      genres: JSON.stringify(genres ?? []),
      voteAverage: voteAverage ?? null,
      releaseDate: releaseDate ?? null,
    },
  });
  return NextResponse.json(item, { status: 201 });
}
