import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.BUILDIUM_API_KEY;
  
  try {
    const response = await fetch("https://api.buildium.com/v1/leases", {
      headers: {
        "x-buildium-api-key": apiKey || "",
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Error al consultar Leases" }, { status: 500 });
  }
}