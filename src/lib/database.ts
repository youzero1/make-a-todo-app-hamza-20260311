import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Todo } from '@/entities/Todo';
import path from 'path';
import fs from 'fs';

let dataSource: DataSource | null = null;

export async function getDataSource(): Promise<DataSource> {
  if (dataSource && dataSource.isInitialized) {
    return dataSource;
  }

  const dbPath = process.env.DATABASE_PATH || './data/todos.db';
  const resolvedPath = path.resolve(process.cwd(), dbPath);
  const dir = path.dirname(resolvedPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  dataSource = new DataSource({
    type: 'better-sqlite3',
    database: resolvedPath,
    entities: [Todo],
    synchronize: true,
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log('Database initialized at:', resolvedPath);
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }

  return dataSource;
}

export async function getTodoRepository() {
  const ds = await getDataSource();
  return ds.getRepository(Todo);
}
