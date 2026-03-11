import 'reflect-metadata';
import { NextRequest, NextResponse } from 'next/server';
import { getTodoRepository } from '@/lib/database';

export async function GET() {
  try {
    const repo = await getTodoRepository();
    const todos = await repo.find({
      order: { createdAt: 'DESC' },
    });
    return NextResponse.json(todos, { status: 200 });
  } catch (error) {
    console.error('GET /api/todos error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch todos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    if (
      typeof body !== 'object' ||
      body === null ||
      !('title' in body) ||
      typeof (body as Record<string, unknown>).title !== 'string'
    ) {
      return NextResponse.json(
        { error: 'Title is required and must be a string' },
        { status: 400 }
      );
    }

    const { title, description } = body as { title: string; description?: string };

    if (!title.trim()) {
      return NextResponse.json(
        { error: 'Title cannot be empty' },
        { status: 400 }
      );
    }

    const repo = await getTodoRepository();
    const todo = repo.create({
      title: title.trim(),
      description: description?.trim() || null,
      completed: false,
    });

    const saved = await repo.save(todo);
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error('POST /api/todos error:', error);
    return NextResponse.json(
      { error: 'Failed to create todo' },
      { status: 500 }
    );
  }
}
