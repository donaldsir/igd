import cloudinary from 'cloudinary';
import { NextRequest, NextResponse } from "next/server";


cloudinary.v2.config({
    cloud_name: 'dh1sqyt2q',
    api_key: '317222246871665',
    api_secret: 'MqEFGBYO6EnWBnkSTEpkHy9h8Sg',
});

export async function POST(req: NextRequest) {
    const fd = await req.formData();
    const public_id = fd.get('public_id') as string

    if (!public_id) {
        return NextResponse.json({ success: false, error: 'Public ID tidak ditemukan dalam URL' }, { status: 500 });
    }

    try {
        // Menghapus file dari Cloudinary menggunakan public_id
        const result = await cloudinary.v2.uploader.destroy(public_id, {
            resource_type: 'video', // Gunakan 'video' jika Anda menghapus video
        });

        if (result.result === 'ok') {
            return NextResponse.json({ success: true, message: "File deleted" }, { status: 200 })
        } else {
            return NextResponse.json({ success: false, error: 'Gagal menghapus file' }, { status: 500 });
        }
    } catch (error) {
        if (typeof error === "string") {
            return NextResponse.json({ success: false, error: error.toUpperCase() }, { status: 500 });
        } else if (error instanceof Error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }
    }
}