import { NextRequest, NextResponse } from 'next/server'
import { users } from '@/lib/data'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = users.find((u) => u.id === parseInt(id))

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json(user)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const user = users.find((u) => u.id === parseInt(id))

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const updatedUser = { ...user, ...body, id: user.id }
  return NextResponse.json(updatedUser)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = users.find((u) => u.id === parseInt(id))

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json({})
}
