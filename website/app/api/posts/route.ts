import { NextRequest, NextResponse } from 'next/server'
import { posts } from '@/lib/data'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  let result = posts

  if (userId) {
    result = posts.filter((p) => p.userId === parseInt(userId))
  }

  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const newPost = {
    id: posts.length + 1,
    userId: body.userId || 1,
    title: body.title || 'Untitled',
    body: body.body || '',
  }
  return NextResponse.json(newPost, { status: 201 })
}
