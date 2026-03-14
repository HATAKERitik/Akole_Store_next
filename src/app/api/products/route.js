import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';

// Configure cloudinary explicitly without assuming CLOUDINARY_URL format works fully automatically in all nextjs environments
cloudinary.config({
    cloud_name: 'dfmo2iznu',
    api_key: '285625431479728',
    api_secret: 'GUPrf3PhddoOhjTUYnnRKL4Zq5k',
    secure: true,
});

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

        const uploadedPaths = [];
        for (const file of images) {
            if (file && typeof file !== 'string') {
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);

                const uploadResult = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: 'akole_store_products' },
                        (error, result) => {
                            if (error) return reject(error);
                            resolve(result);
                        }
                    );
                    uploadStream.end(buffer);
                });

                uploadedPaths.push(uploadResult.secure_url);
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
