import cloudinary from 'cloudinary';
import { NextRequest, NextResponse } from "next/server";


cloudinary.v2.config({
    cloud_name: 'dh1sqyt2q',
    api_key: '317222246871665',
    api_secret: 'MqEFGBYO6EnWBnkSTEpkHy9h8Sg',
});

export async function GET() {
    try {
        // Ambil informasi usage akun
        const usage = await cloudinary.v2.api.usage();

        return NextResponse.json({
            success: true,
            storage: usage.storage.used_percent,
            bandwidth: usage.bandwidth.used_percent,
            requests: usage.requests,
        }, { status: 200 })


    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const fd = await req.formData();
        const title = fd.get('title') as File
        const videoWidth = parseInt(fd.get('videoWidth') as string)
        const public_id_video = fd.get('public_id') as string

        if (title) {
            const titleBuffer = Buffer.from(await title.arrayBuffer());

            // Upload title
            await new Promise((resolve, reject) => {
                cloudinary.v2.uploader.upload_stream(
                    { public_id: "title", resource_type: 'image', overwrite: true },
                    (error) => {
                        if (error) reject(error);
                        else resolve(null);
                    }
                ).end(titleBuffer);
            });

            const videoResult = cloudinary.v2.url(public_id_video, {
                resource_type: 'video',
                transformation: [
                    { overlay: 'watermark', gravity: 'north', y: 80 }, // Tambahkan watermark
                    { overlay: 'title', width: videoWidth, gravity: 'south', y: 80 }, // Tambahkan title
                    { format: 'mp4' } // Atur format video menjadi MP4
                ],
            });


            // Respon dengan URL video yang sudah digabung
            return NextResponse.json({ success: true, url: videoResult, title: true }, { status: 200 })
        } else {
            const videoResult = cloudinary.v2.url(public_id_video, {
                resource_type: 'video',
                transformation: [
                    { overlay: 'watermark', gravity: 'north', y: 80 }, // Tambahkan watermark
                    { format: 'mp4' } // Atur format video menjadi MP4
                ],
            });


            // Respon dengan URL video yang sudah digabung
            return NextResponse.json({ success: true, url: videoResult, title: false }, { status: 200 })
        }

    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}