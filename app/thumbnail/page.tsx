"use client";
import { useState, useRef } from "react";
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
    CardFooter
} from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import { FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import * as htmlToImage from "html-to-image";
import { capitalizeWords } from "../config";
import { Roboto } from 'next/font/google'

const roboto = Roboto({
    weight: '700',
    subsets: ['latin'],
})

export default function Page() {
    const router = useRouter();
    const toast = useToast();

    const [gambar, setGambar] = useState("");
    const [title, setTitle] = useState(``);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const onChangeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const { files } = e.target;
        const selectedFiles = files as FileList;

        if (selectedFiles) {

            toast({
                title: "Please wait",
                description: "Preparing thumbnail...",
                status: "loading",
                duration: null,
            });

            const fileType = selectedFiles[0]['type'];
            const imageTypes = ['image/gif', 'image/jpeg', 'image/png', 'image/jpeg', , 'image/webp'];

            if (imageTypes.includes(fileType)) {
                const blob = new Blob([selectedFiles[0]]);
                const imgsrc = URL.createObjectURL(blob);
                setGambar(imgsrc);
            } else {
                if (videoRef.current) {
                    const videoSrc = URL.createObjectURL(new Blob([selectedFiles[0]], { type: "video/mp4" }))
                    videoRef.current.src = videoSrc;

                    const videoElement = document.getElementById("video") as HTMLVideoElement;
                    const canvasElement = document.getElementById("canvasElement") as HTMLCanvasElement;

                    await videoElement.play()
                    videoElement.pause()

                    // Set canvas size to video frame size
                    canvasElement.width = videoElement.videoWidth;
                    canvasElement.height = videoElement.videoHeight;

                    // Draw the current frame of the video onto the canvas
                    const context = canvasElement.getContext("2d");
                    if (context) {
                        context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
                    }

                    setGambar(canvasElement.toDataURL("image/png"))
                }
            }

            toast.closeAll()
        }

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

    const download = (elementId: string, filename: string) => {
        const element = document.getElementById(elementId);

        if (!element) {
            toast({
                title: title,
                description: `Element with id "${elementId}" not found.`,
                status: 'error',
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
                            <Button
                                onClick={() => setTitle(capitalizeWords(title))}
                                colorScheme="teal"
                                size="sm"
                                mt={4}
                                ml={1}
                            >
                                Capitalize
                            </Button>
                            <Button
                                onClick={() => download("canvas", createFileName())}
                                colorScheme="teal"
                                size="sm"
                                mt={4}
                                ml={1}
                            >
                                Download Result
                            </Button>
                        </CardBody>
                        <CardFooter>
                            <video
                                id="video"
                                style={{
                                    display: "none"
                                }}
                                ref={videoRef}
                                controls
                            ></video>
                            <canvas style={{
                                display: "none"
                            }} id="canvasElement"></canvas>
                        </CardFooter>
                    </Card>
                    <Center id="canvas" style={{ position: "relative", width: 400, height: 500 }}>
                        <Image
                            src="/images/logo-pd.png"
                            w={100}
                            style={{ position: "absolute", top: 20 }}
                            alt="logo white"
                        />
                        <Image src={gambar ? gambar : "/images/no-image.jpg"} w={400} h={500} fit="cover" alt="media" />
                        <Container
                            style={{ position: "absolute", bottom: 60, boxShadow: '7px 7px #148b9d' }}
                            bg="rgba(255,255,255,0.9)"
                            w="85%"
                            p={2}
                        >
                            <Text
                                fontSize={24}
                                lineHeight={1.1}
                                px={1}
                                className={roboto.className}
                                textAlign="center"
                            >
                                {title}
                            </Text>
                        </Container>
                    </Center>
                </SimpleGrid>
            </Box>
        </VStack>
    )
}