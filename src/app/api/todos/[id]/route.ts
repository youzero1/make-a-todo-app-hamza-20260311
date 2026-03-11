import 'reflect-metadata';
import { NextRequest, NextResponse } from 'next/server';
import { getTodoRepository } from '@/lib/database';

type RouteParams = { params: { id: string } };

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const body: unknown = await request.json();
    if (typeof body !== 'object' || body === null) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const repo = await getTodoRepository();
    const todo = await repo.findOne({ where: { id } });

    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    const updates = body as Record<string, unknown>;

    if ('title' in updates) {
      if (typeof updates.title !== 'string' || !updates.title.trim()) {
        return NextResponse.json(
          { error: 'Title must be a non-empty string' },
          { status: 400 }
        );
      }
      todo.title = updates.title.trim();
    }

    if ('description' in updates) {
      if (updates.description === null || updates.description === undefined) {
        todo.description = null;
      } else if (typeof updates.description === 'string') {
        todo.description = updates.description.trim() || null;
      }
    }

    if ('completed' in updates) {
      if (typeof updates.completed !== 'boolean') {
        return NextResponse.json(
          { error: 'Completed must be a boolean' },
          { status: 400 }
        );
      }
      todo.completed = updates.completed;
    }

    const saved = await repo.save(todo);
    return NextResponse.json(saved, { status: 200 });
  } catch (error) {
    console.error('PUT /api/todos/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update todo' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const repo = await getTodoRepository();
    const todo = await repo.findOne({ where: { id } });

    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    await repo.remove(todo);
    return NextResponse.json({ message: 'Todo deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/todos/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete todo' },
      { status: 500 }
    );
  }
}
