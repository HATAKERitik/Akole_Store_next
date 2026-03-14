import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const products = await prisma.product.findMany();
        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const formData = await req.formData();
        const name = formData.get('name');
        const description = formData.get('description');
        const price = formData.get('price');
        const images = formData.getAll('images'); // Multiple files

        const uploadsDir = path.join(process.cwd(), 'public/uploads');
        if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true });
        }

        const uploadedPaths = [];
        for (const file of images) {
            if (file && typeof file !== 'string') {
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const filename = `${uniqueSuffix}-${file.name.replace(/\\s+/g, '_')}`;
                const filepath = path.join(uploadsDir, filename);
                await writeFile(filepath, buffer);
                uploadedPaths.push(`/uploads/${filename}`);
            }
        }

        const imageUrls = uploadedPaths.length > 0 ? JSON.stringify(uploadedPaths) : null;

        const product = await prisma.product.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                imageUrls
            }
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error("PRODUCT CREATION ERROR: ", error);
        return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
    }
}
