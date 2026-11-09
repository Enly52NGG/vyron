import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "";
  const type = req.nextUrl.searchParams.get("type") || "track";
  const limit = req.nextUrl.searchParams.get("limit") || "20";

  if (!q.trim()) {
    return NextResponse.json({ data: [] });
  }

  try {
    const url = `https://api.deezer.com/search/${type === "all" ? "track" : type}?q=${encodeURIComponent(q)}&limit=${limit}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "VYRON/1.0" },
      next: { revalidate: 300 },
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
