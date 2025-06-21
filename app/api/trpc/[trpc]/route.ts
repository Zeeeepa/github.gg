import { NextRequest, NextResponse } from "next/server";

// Temporary simplified handler to fix build issues
export const runtime = 'nodejs';

const handler = async (req: NextRequest) => {
  return NextResponse.json({ 
    error: "tRPC temporarily disabled during build fix",
    message: "Please check back later" 
  }, { status: 503 });
};

export { handler as GET, handler as POST };
