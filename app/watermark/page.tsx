"use client";
import { useState, useEffect } from "react";
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
import { capitalizeWords, getVideoResolution } from "../config";
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

  const [title, setTitle] = useState(``);
  const [videoFile, setVideoFile] = useState<File>();
  const [videoSrc, setVideoSrc] = useState("");
  const [videoWidth, setVideoWidth] = useState(0)
  const [ffmpeg, setFfmpeg] = useState<FFmpeg | null>(null);

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

    // Cek jika target atau target.files null
    if (!target || !target.files || target.files.length === 0) {
      console.error("Harap unggah file video terlebih dahulu.");
      return;
    }

    const videoUrl = URL.createObjectURL(new Blob([target.files[0]], { type: 'video/mp4' }));
    setVideoFile(target.files[0])

    getVideoResolution(videoUrl)
      .then(({ width }) => {
        setVideoWidth(width)
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const createFileName = () => {
    // Generate a random string
    const randomString = Math.random().toString(36).substring(2, 10);

    // Get the current timestamp
    const timestamp = Date.now();

    // Construct the file name using the random string, timestamp, and extension
    const fileName = `pd_${randomString}_${timestamp}`;

    return fileName;
  };

  const render = async () => {
    toast({
      title: "Please wait",
      description: "Rendering video...",
      status: "loading",
      duration: null,
    });

    try {
      // Load FFmpeg jika belum dimuat
      if (ffmpeg) {

        // Tulis file input dan watermark ke sistem virtual
        await ffmpeg.writeFile("input.mp4", await fetchFile(videoFile));
        await ffmpeg.writeFile("watermark.png", await fetchFile("/images/logo-pd-64.png"));

        const element = document.getElementById("canvas");
        if (element) {
          const dataUrl = await htmlToImage.toPng(element, {
            style: {
              border: "none", // Hapus border jika ada
              margin: "0", // Hapus margin jika ada
            },
          });

          await ffmpeg.writeFile("title.png", await fetchFile(dataUrl));
          await ffmpeg.exec([
            "-i", "input.mp4",
            "-i", "title.png",
            "-i", "watermark.png",
            "-filter_complex",
            `[1:v]scale=${videoWidth}:-1[title]; [0:v][title]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/1.2[watermark]; [watermark]overlay=(W-w)/2:60`,
            "-preset", "ultrafast",
            '-crf', '30',
            "output.mp4",
          ]);
        } else {
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
        }

        // Baca file hasil dan tampilkan
        const data = await ffmpeg.readFile('output.mp4');
        const videoUrl = URL.createObjectURL(new Blob([data], { type: 'video/mp4' }));
        const elVideo = document.getElementById('outputVideo') as HTMLVideoElement

        if (elVideo) {
          elVideo.src = videoUrl
          setVideoSrc(videoUrl)
        } else {
          console.log("Video gagal diproses!");
        }

        toast.closeAll();

      }
    } catch (error) {
      console.error("Kesalahan saat memproses video:", error);
      toast.closeAll();
    }
  }

  const downloadVideo = () => {
    const link = document.createElement("a");
    link.download = createFileName();
    link.href = videoSrc;
    link.click();
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
                <FormLabel>Video</FormLabel>
                <Input type="file" accept="video/*" size="sm" onChange={(e) => onChangeFile(e)} />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>
                  Title (Optional) <span style={{ color: "red", fontSize: 14 }}>({`${title.trim().length}/100`})</span>
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

          </Card>
          <Card>
            <CardBody>
              {title !== "" && (
                <Center id="canvas" style={{ position: "relative", height: 180, }}>
                  <Container
                    style={{ position: "absolute", boxShadow: "7px 7px #148b9d" }}
                    bg="rgba(255,255,255,0.9)"
                    w="85%"
                    p={2}
                  >
                    <Text fontSize={24} className={roboto.className} textAlign="center" lineHeight={1.1}>
                      {title}
                    </Text>
                  </Container>
                </Center>
              )}
            </CardBody>
            <CardFooter>
              <VStack>
                <video id="outputVideo" controls style={{ maxWidth: '100%' }}></video>
                <Button onClick={downloadVideo} colorScheme="teal" size="sm" mt={4} width='100%'>
                  Download
                </Button>
              </VStack>
            </CardFooter>
          </Card>
        </SimpleGrid>
      </Box>
    </VStack>
  );
}
