import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { AboutArticle } from '../../../types/About';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'aboutArticles.json');

async function getArticles(): Promise<AboutArticle[]> {
  try {
    const data = await fs.readFile(DATA_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function saveArticles(articles: AboutArticle[]) {
  const dir = path.dirname(DATA_FILE_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(articles, null, 2), 'utf8');
}

export async function GET() {
  try {
    const articles = await getArticles();
    return NextResponse.json(articles);
  } catch (error) {
    console.error('GET /api/about error:', error);
    return NextResponse.json({ message: 'Failed to fetch articles' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const articles = await getArticles();
    const newArticle: AboutArticle = {
      ...body,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };
    articles.push(newArticle);
    await saveArticles(articles);
    return NextResponse.json(newArticle);
  } catch (error) {
    console.error('POST /api/about error:', error);
    return NextResponse.json({ message: 'Failed to create article' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    
    const articles = await getArticles();
    const index = articles.findIndex(a => a.id === id);
    
    if (index === -1) {
      return NextResponse.json({ message: 'Article not found' }, { status: 404 });
    }

    articles[index] = { ...articles[index], ...body };
    await saveArticles(articles);
    return NextResponse.json(articles[index]);
  } catch (error) {
    console.error('PUT /api/about error:', error);
    return NextResponse.json({ message: 'Failed to update article' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ message: 'ID is required' }, { status: 400 });

    let articles = await getArticles();
    articles = articles.filter(a => a.id !== id);

    await saveArticles(articles);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to delete article' }, { status: 500 });
  }
}