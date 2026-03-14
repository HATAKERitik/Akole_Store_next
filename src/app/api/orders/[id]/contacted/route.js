import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(req, { params }) {
    try {
        const { id } = params;
        const { contacted } = await req.json();

        const order = await prisma.order.update({
            where: { id: parseInt(id) },
            data: { contacted: Boolean(contacted) }
        });

        return NextResponse.json(order);
    } catch (error) {
        console.error("Order PUT Error:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
