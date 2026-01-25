import { NextRequest, NextResponse } from 'next/server'
import { todos } from '@/lib/data'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const todo = todos.find((t) => t.id === parseInt(id))

  if (!todo) {
    return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
  }

  return NextResponse.json(todo)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const todo = todos.find((t) => t.id === parseInt(id))

  if (!todo) {
    return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
  }

  const updatedTodo = { ...todo, ...body, id: todo.id }
  return NextResponse.json(updatedTodo)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const todo = todos.find((t) => t.id === parseInt(id))

  if (!todo) {
    return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
  }

  const patchedTodo = { ...todo, ...body }
  return NextResponse.json(patchedTodo)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const todo = todos.find((t) => t.id === parseInt(id))

  if (!todo) {
    return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
  }

  return NextResponse.json({})
}
