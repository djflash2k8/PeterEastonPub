import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { AboutArticle } from '../../../types/About'
import {
  queryCollectionFromFirebase,
  setDocumentInFirebase,
  deleteDocumentFromFirebase,
} from '@/lib/firebase'

const COLLECTION = 'about-articles'

async function getArticles(): Promise<AboutArticle[]> {
  const docs = await queryCollectionFromFirebase(COLLECTION)
  return docs as AboutArticle[]
}

export async function GET() {
  try {
    const articles = await getArticles()
    // Sort newest first
    articles.sort((a: any, b: any) =>
      new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    )
    return NextResponse.json(articles)
  } catch (error) {
    console.error('GET /api/about error:', error)
    return NextResponse.json({ message: 'Failed to fetch articles' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const newArticle: AboutArticle = {
      ...body,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    }
    await setDocumentInFirebase(COLLECTION, newArticle.id, newArticle)
    return NextResponse.json(newArticle)
  } catch (error) {
    console.error('POST /api/about error:', error)
    return NextResponse.json({ message: 'Failed to create article' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ message: 'ID is required' }, { status: 400 })

    const body = await request.json()
    const updated = { ...body, id, updatedAt: new Date().toISOString() }
    await setDocumentInFirebase(COLLECTION, id, updated)
    return NextResponse.json(updated)
  } catch (error) {
    console.error('PUT /api/about error:', error)
    return NextResponse.json({ message: 'Failed to update article' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ message: 'ID is required' }, { status: 400 })

    await deleteDocumentFromFirebase(COLLECTION, id)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return NextResponse.json({ message: 'Failed to delete article' }, { status: 500 })
  }
}
