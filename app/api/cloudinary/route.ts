import cloudinary, { UploadApiResponse } from 'cloudinary';
import { NextRequest, NextResponse } from "next/server";
import streamifier from 'streamifier';

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
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
        const videoFile = fd.get('video');
        const title = fd.get('title') as File
        const videoWidth = parseInt(fd.get('videoWidth') as string)

        if (!videoFile || !(videoFile instanceof File)) {
            return NextResponse.json({ success: false, message: 'No video file uploaded' }, { status: 400 });
        }

        // Mengonversi video ke Buffer
        const videoBuffer = Buffer.from(await videoFile.arrayBuffer());
        const public_id_video = `video_${Date.now()}`

        // return NextResponse.json({ success: true, message: title.name }, { status: 200 });

        if (title.name) {

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

            // Upload video dan tambahkan watermark
            const videoResult: UploadApiResponse = await new Promise((resolve, reject) => {
                const cloudinaryUploadStream = cloudinary.v2.uploader.upload_stream(
                    {
                        resource_type: 'video',
                        public_id: public_id_video,
                        overwrite: true,
                        transformation: [
                            { overlay: 'watermark', gravity: 'north', y: 80 },
                            { overlay: "title", width: videoWidth, gravity: 'south', y: 50 },
                            { format: 'mp4' }
                        ]
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result as UploadApiResponse);
                    }
                ).end(videoBuffer);

                // Membaca stream dari video buffer dan mengunggah ke Cloudinary
                streamifier.createReadStream(videoBuffer).pipe(cloudinaryUploadStream);
            });

            // Respon dengan URL video yang sudah digabung
            return NextResponse.json({ success: true, url: videoResult.secure_url, title: true }, { status: 200 })
        } else {
            // Upload video dan tambahkan watermark
            const videoResult: UploadApiResponse = await new Promise((resolve, reject) => {
                const cloudinaryUploadStream = cloudinary.v2.uploader.upload_stream(
                    {
                        resource_type: 'video',
                        public_id: public_id_video,
                        overwrite: true,
                        transformation: [
                            { overlay: 'watermark', gravity: 'north', y: 80 },
                            { format: 'mp4' }
                        ]
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result as UploadApiResponse);
                    }
                ).end(videoBuffer);

                // Membaca stream dari video buffer dan mengunggah ke Cloudinary
                streamifier.createReadStream(videoBuffer).pipe(cloudinaryUploadStream);
            });
            // Respon dengan URL video yang sudah digabung
            return NextResponse.json({ success: true, url: videoResult.secure_url, title: false }, { status: 200 })
        }

    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}