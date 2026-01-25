import { NextRequest, NextResponse } from 'next/server'
import { comments } from '@/lib/data'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const comment = comments.find((c) => c.id === parseInt(id))

  if (!comment) {
    return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
  }

  return NextResponse.json(comment)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const comment = comments.find((c) => c.id === parseInt(id))

  if (!comment) {
    return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
  }

  const updatedComment = { ...comment, ...body, id: comment.id }
  return NextResponse.json(updatedComment)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const comment = comments.find((c) => c.id === parseInt(id))

  if (!comment) {
    return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
  }

  return NextResponse.json({})
}
