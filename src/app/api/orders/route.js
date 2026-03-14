import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const orders = await prisma.order.findMany({
            include: { product: true, user: true }
        });
        return NextResponse.json(orders);
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const { productId, userId, quantity, address } = await req.json();

        if (!address || address.trim() === "") {
            return NextResponse.json({ error: 'Address is required' }, { status: 400 });
        }

        const order = await prisma.order.create({
            data: {
                productId: parseInt(productId),
                userId: parseInt(userId),
                quantity: parseInt(quantity),
                address: address
            }
        });

        return NextResponse.json(order, { status: 201 });
    } catch (error) {
        console.error("Order POST Error:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
