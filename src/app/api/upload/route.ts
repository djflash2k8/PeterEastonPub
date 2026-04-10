import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ message: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Define path: public/uploads
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    const fileName = `${randomUUID()}-${file.name.replace(/\s+/g, '-')}`;
    const filePath = path.join(uploadDir, fileName);

    await fs.writeFile(filePath, buffer);
    
    return NextResponse.json({ url: `/uploads/${fileName}` });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ message: 'Upload failed' }, { status: 500 });
  }
}