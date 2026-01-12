import { NextRequest, NextResponse } from 'next/server'
import { posts } from '@/lib/data'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const post = posts.find((p) => p.id === parseInt(id))

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  return NextResponse.json(post)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const post = posts.find((p) => p.id === parseInt(id))

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  const updatedPost = { ...post, ...body, id: post.id }
  return NextResponse.json(updatedPost)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const post = posts.find((p) => p.id === parseInt(id))

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  const patchedPost = { ...post, ...body }
  return NextResponse.json(patchedPost)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const post = posts.find((p) => p.id === parseInt(id))

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  return NextResponse.json({})
}
