import { NextResponse } from "next/server"
import { getConversation } from "@/lib/api/chatwoot-demo-store"
import { getChatwootConfig } from "@/lib/chatwoot/client"

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: RouteContext) {
  const { id } = await params
  if (!id) return NextResponse.json({ error: "id_requerido" }, { status: 400 })

  const body = await request.json().catch(() => null)
  const intervene = body?.intervene === true

  if (getChatwootConfig()) {
    return NextResponse.json({ handledBy: intervene ? "human" : "ai" })
  }

  const conv = getConversation(id)
  if (!conv) {
    return NextResponse.json({ error: "no_encontrado" }, { status: 404 })
  }

  return NextResponse.json({ handledBy: intervene ? "human" : "ai" })
}
