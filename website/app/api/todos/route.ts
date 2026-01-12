import { NextRequest, NextResponse } from 'next/server'
import { todos } from '@/lib/data'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const completed = searchParams.get('completed')

  let result = todos

  if (userId) {
    result = result.filter((t) => t.userId === parseInt(userId))
  }

  if (completed !== null) {
    result = result.filter((t) => t.completed === (completed === 'true'))
  }

  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const newTodo = {
    id: todos.length + 1,
    userId: body.userId || 1,
    title: body.title || 'New todo',
    completed: body.completed || false,
  }
  return NextResponse.json(newTodo, { status: 201 })
}
