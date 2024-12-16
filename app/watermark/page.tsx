"use client";
import { useState, useRef, useEffect } from "react";
import {
  FormControl,
  Input,
  Button,
  SimpleGrid,
  Box,
  Card,
  CardBody,
  Spacer,
  VStack,
  Image,
  StackDivider,
  IconButton,
  HStack,
  Textarea,
  FormLabel,
  Text,
  Center,
  Container,
  CardFooter,
} from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import { FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import * as htmlToImage from "html-to-image";
import { capitalizeWords } from "../config";
import { Roboto } from "next/font/google";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

const roboto = Roboto({
  weight: "700",
  subsets: ["latin"],
});

export default function Page() {
  const router = useRouter();
  const toast = useToast();

  const [gambar, setGambar] = useState("");
  const [title, setTitle] = useState(``);
  const [isVideo, setIsVideo] = useState(false)
  const [videoFile, setVideoFile] = useState<File>();
  const [ffmpeg, setFfmpeg] = useState<FFmpeg | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);


  useEffect(() => {
    const loadFFmpeg = async () => {
      const ffmpegInstance = new FFmpeg(); // Menggunakan `FFmpeg` langsung
      await ffmpegInstance.load();
      setFfmpeg(ffmpegInstance);
    };

    loadFFmpeg();
  }, []);

  const onChangeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target; // Ambil target dari event

    toast({
      title: "Please wait",
      description: "Rendering video...",
      status: "loading",
      duration: null,
    });


    // Cek jika target atau target.files null
    if (!target || !target.files || target.files.length === 0) {
      console.error("Harap unggah file video terlebih dahulu.");
      return;
    }

    const fileInput = target.files[0]; // Ambil file video pertama yang diunggah

    try {
      // Load FFmpeg jika belum dimuat
      if (ffmpeg) {

        // Tulis file input dan watermark ke sistem virtual
        await ffmpeg.writeFile("input.mp4", await fetchFile(fileInput));
        await ffmpeg.writeFile("watermark.png", await fetchFile("/images/logo-pd-64.png"));

        // Tambahkan watermark ke video
        await ffmpeg.exec([
          '-i', 'input.mp4',
          '-i', 'watermark.png',
          '-filter_complex', 'overlay=(W-w)/2:50',
          '-codec:a', 'copy',
          "-preset", "ultrafast",
          '-crf', '30',
          'output.mp4'
        ]);

        // Baca file hasil dan tampilkan
        const data = await ffmpeg.readFile('output.mp4');
        const videoUrl = URL.createObjectURL(new Blob([data], { type: 'video/mp4' }));
        const elVideo = document.getElementById('outputVideo') as HTMLVideoElement

        if (elVideo) {
          elVideo.src = videoUrl
          console.log(videoUrl);
        } else {
          console.log("Video gagal diproses!");
        }


        console.log("Video berhasil diproses!");
        toast.closeAll();
      }


    } catch (error) {
      console.error("Kesalahan saat memproses video:", error);
      toast.closeAll();
    }
  };

  const screenShotVideo = () => {
    const videoElement = document.getElementById("video") as HTMLVideoElement;
    const canvasElement = document.getElementById("canvasElement") as HTMLCanvasElement;

    // Set canvas size to video frame size
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;

    // Draw the current frame of the video onto the canvas
    const context = canvasElement.getContext("2d");
    if (context) {
      context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
    }

    setGambar(canvasElement.toDataURL("image/png"));
  }

  const createFileName = () => {
    // Generate a random string
    const randomString = Math.random().toString(36).substring(2, 10);

    // Get the current timestamp
    const timestamp = Date.now();

    // Construct the file name using the random string, timestamp, and extension
    const fileName = `pd_${randomString}_${timestamp}`;

    return fileName;
  };

  function getVideoResolution(url: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.src = url;

      // Tunggu sampai metadata video (termasuk resolusi) tersedia
      video.onloadedmetadata = () => {
        resolve({ width: video.videoWidth, height: video.videoHeight });
      };

      video.onerror = (error) => {
        reject("Gagal memuat video: " + error);
      };
    });
  }

  const render = async () => {
    toast({
      title: "Please wait",
      description: "Preparing thumbnail...",
      status: "loading",
      duration: null,
    });

    const videoRes = {
      width: 0,
      height: 0,
    };

    // const videoUrl = URL.createObjectURL(new Blob([videoFile.buffer], { type: 'video/mp4' }));

    // getVideoResolution(videoFile)
    //   .then(({ width, height }) => {
    //     videoRes.width = width;
    //     videoRes.height = height;
    //   })
    //   .catch((error) => {
    //     console.error(error);
    //   });

    if (ffmpeg) {
      await ffmpeg.load();
      await ffmpeg.writeFile("input.mp4", await fetchFile(videoFile));
      await ffmpeg.writeFile("watermark.png", await fetchFile("/images/logo-pd-64.png"));

      await ffmpeg.exec([
        '-i', 'input.mp4',        // Input video
        '-i', 'watermark.png',    // Input watermark
        '-filter_complex', 'overlay=(W-w)/2:80', // Filter overlay (posisi watermark: x=10, y=10)
        '-codec:a', 'copy',       // Salin audio tanpa encoding ulang
        "-preset", "ultrafast",
        '-crf', '30',
        'output.mp4'              // Output video
      ]);

      const dataFF = await ffmpeg.readFile("output.mp4");

      if (videoRef.current) {
        videoRef.current.src = URL.createObjectURL(new Blob([dataFF], { type: "video/mp4" }));
        toast.closeAll();
      }
    }

  }

  const download = (elementId: string, filename: string) => {
    const element = document.getElementById(elementId);

    if (!element) {
      toast({
        title: title,
        description: `Element with id "${elementId}" not found.`,
        status: "error",
        duration: 9000,
        isClosable: true,
        position: "bottom-left",
      });
      return;
    }

    htmlToImage.toJpeg(element, { quality: 0.95 }).then(function (dataUrl) {
      const link = document.createElement("a");
      link.download = `${filename}.jpeg`;
      link.href = dataUrl;
      link.click();
    });
  };

  return (
    <VStack divider={<StackDivider borderColor="gray.200" />} align="stretch">
      <Box>
        <HStack px={2} pt={2}>
          <IconButton
            colorScheme="teal"
            variant="outline"
            aria-label="Call Segun"
            size="md"
            icon={<FaArrowLeft />}
            onClick={() => router.push("/")}
          />
          <Spacer />
          <Image src="/images/logo-text.png" w={100} alt="logo" />
        </HStack>
      </Box>
      <Box>
        <SimpleGrid columns={{ md: 2, sm: 1 }} m={4} spacing={8}>
          <Card>
            <CardBody>
              <FormControl>
                <FormLabel>Image/Video</FormLabel>
                <Input type="file" accept="image/*|video/*" size="sm" onChange={(e) => onChangeFile(e)} />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>
                  Title <span style={{ color: "red", fontSize: 14 }}>({`${title.trim().length}/100`})</span>
                </FormLabel>
                <Textarea
                  value={title}
                  style={{ whiteSpace: "pre-wrap" }}
                  size="sm"
                  rows={3}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </FormControl>
              <Button onClick={() => setTitle(capitalizeWords(title))} colorScheme="teal" size="sm" mt={4} ml={1}>
                Capitalize
              </Button>
              <Button onClick={render} colorScheme="teal" size="sm" mt={4} ml={1}>
                Render
              </Button>
            </CardBody>
            <CardFooter>

              <VStack>
                <video id="outputVideo" controls style={{ maxWidth: '100%' }}></video>
                <SimpleGrid columns={3} >
                  <Button style={{ display: isVideo ? "" : "none" }} onClick={screenShotVideo} colorScheme="teal" size="sm" mt={4} ml={1}>
                    Screenshot
                  </Button>
                </SimpleGrid>
              </VStack>
            </CardFooter>
          </Card>

        </SimpleGrid>
      </Box>
    </VStack>
  );
}
