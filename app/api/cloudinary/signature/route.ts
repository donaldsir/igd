import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from "next/server";

cloudinary.config({
    cloud_name: 'dh1sqyt2q',
    api_key: '317222246871665',
    api_secret: 'MqEFGBYO6EnWBnkSTEpkHy9h8Sg',
});

export async function GET() {
    const timestamp = Math.floor(Date.now() / 1000); // Timestamp saat ini

    // Parameter untuk di-sign
    const paramsToSign = {
        timestamp,
    };

    // Buat signature
    const signature = cloudinary.utils.api_sign_request(paramsToSign, 'MqEFGBYO6EnWBnkSTEpkHy9h8Sg');

    return NextResponse.json({ signature, timestamp, api_key: cloudinary.config().api_key, cloud_name: cloudinary.config().cloud_name }, { status: 200 })
}