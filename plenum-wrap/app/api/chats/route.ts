// app/api/chats/route.ts
import { db } from '@/lib/db' // Assuming you have a db client setup
import { chats, Chat } from '@/lib/db/schema'
// import { auth } from '@clerk/nextjs/server' // REMOVED: Not using Clerk
import { NextRequest, NextResponse } from 'next/server'
import { asc } from 'drizzle-orm' // For ordering

export async function GET(req: NextRequest) {
  try {
    // --- CUSTOM LOGIN INTEGRATION START ---
    // IMPORTANT: Replace this with your actual custom login system's way of getting the user ID.
    // Common methods:
    // 1. From a session cookie:
    //    const userId = req.cookies.get('your_session_cookie_name')?.value;
    // 2. From an Authorization header (e.g., Bearer token):
    //    const authHeader = req.headers.get('Authorization');
    //    if (!authHeader || !authHeader.startsWith('Bearer ')) {
    //      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    //    }
    //    const token = authHeader.split(' ')[1];
    //    // You'll need to verify/decode the token to get the userId
    //    const userId = verifyToken(token); // Implement your token verification logic

    // For demonstration, let's assume you get it from a simple custom header or a hardcoded value for testing
    // Or, if your frontend sends it in localStorage for simplicity (less secure for prod APIs)
    // For now, I'll use a placeholder that expects a 'x-user-id' header for demonstration.
    // Replace this logic with your actual custom authentication.
    const userId = req.headers.get('x-user-id'); // Placeholder: Expecting user ID in a custom header

    if (!userId) {
      // If no userId is found, return unauthorized
      return new NextResponse(JSON.stringify({ error: 'Unauthorized: User ID not provided or invalid.' }), { status: 401 });
    }
    // --- CUSTOM LOGIN INTEGRATION END ---

    // Parse query parameters for pagination (as used in ChatHistoryClient)
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Fetch chats for the current user, ordered by creation date
    const userChats: Chat[] = await db.query.chats.findMany({
      where: (chats, { eq }) => eq(chats.userId, userId),
      orderBy: [asc(chats.createdAt)], // Or desc for most recent first
      limit: limit,
      offset: offset,
    });

    // You might want to transform the data slightly or include more context
    // For the sidebar, you mainly need id (session_id) and title.
    const formattedChats = userChats.map(chat => ({
      id: chat.id,
      title: chat.title,
      createdAt: chat.createdAt, // Or any other fields needed for sorting/display
    }));

    // For pagination, if you want to indicate if there are more chats
    const hasMore = userChats.length === limit;
    const nextOffset = hasMore ? offset + limit : null;

    return NextResponse.json({ chats: formattedChats, nextOffset });
  } catch (error) {
    console.error('Error fetching chats:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch chats' }), { status: 500 });
  }
}