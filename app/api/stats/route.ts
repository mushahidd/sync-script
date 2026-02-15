import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get total users count
    const totalUsers = await prisma.user.count();
    
    // Get total PDFs/papers count
    const totalPapers = await prisma.fileUpload.count();
    
    // Get total vaults count
    const totalVaults = await prisma.vault.count();
    
    // Get total annotations count
    const totalAnnotations = await prisma.annotation.count();

    return NextResponse.json({
      totalUsers,
      totalPapers,
      totalVaults,
      totalAnnotations,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
