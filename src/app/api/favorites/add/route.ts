import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { BASE_API_URL } from '@/utils/api';

export async function POST(request: Request) {
  const { item_id } = (await request.json()) as { item_id?: string };
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token || !item_id) {
    return NextResponse.json({ message: 'Unauthorized or missing item_id' }, { status: 400 });
  }

  const upstream = await fetch(`${BASE_API_URL}/favorites/add`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ item_id, owner: token }),
    cache: 'no-store',
  });

  const text = await upstream.text();

  if (!upstream.ok) {
    console.error('Favorite add failed:', text);
    return NextResponse.json({ message: 'Failed to add favorite' }, { status: upstream.status });
  }

  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      'content-type': upstream.headers.get('content-type') || 'application/json',
    },
  });
}
