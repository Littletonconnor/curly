import { NextRequest, NextResponse } from 'next/server'
import { comments } from '@/lib/data'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const postId = searchParams.get('postId')

  let result = comments

  if (postId) {
    result = comments.filter((c) => c.postId === parseInt(postId))
  }

  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const newComment = {
    id: comments.length + 1,
    postId: body.postId || 1,
    name: body.name || 'Anonymous',
    email: body.email || 'anonymous@example.com',
    body: body.body || '',
  }
  return NextResponse.json(newComment, { status: 201 })
}
