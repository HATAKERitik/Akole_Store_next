import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(req, { params }) {
    try {
        const { id } = params;

        await prisma.order.delete({
            where: { id: parseInt(id) }
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("Order DELETE Error:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
