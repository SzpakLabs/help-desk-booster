import { NextRequest, NextResponse } from "next/server";
import { searchKnowledgeBase } from "@/lib/rag";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q") ?? "SLA triage E-9207";
  const limit = Number(req.nextUrl.searchParams.get("limit") ?? 4);
  const response = await searchKnowledgeBase(query, Number.isFinite(limit) ? limit : 4);

  return NextResponse.json(response);
}
