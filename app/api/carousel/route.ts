import { NextResponse } from "next/server";
import { promises as fs } from "fs";

export async function GET() {
  const file = await fs.readFile(process.cwd() + "/public/json/carousel", "utf8");
  const result = JSON.parse(file);
  return NextResponse.json({ result: result.data }, { status: 201 });
}
