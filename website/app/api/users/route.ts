import { NextRequest, NextResponse } from 'next/server'
import { users } from '@/lib/data'

export async function GET() {
  return NextResponse.json(users)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const newUser = {
    id: users.length + 1,
    name: body.name || 'New User',
    username: body.username || 'newuser',
    email: body.email || 'newuser@example.com',
    phone: body.phone || '555-0000',
    website: body.website || 'example.com',
    company: body.company || 'Unknown',
  }
  return NextResponse.json(newUser, { status: 201 })
}
