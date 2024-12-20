"use client";
import { useState, useCallback, ChangeEvent, FormEvent } from "react";
import {
    FormControl,
    Input,
    InputGroup,
    InputRightElement,
    Button,
    SimpleGrid,
    Box,
    Card,
    CardHeader,
    CardBody,
    Flex,
    Spacer,
    VStack,
    Image,
    StackDivider,
    IconButton,
    HStack,
    Textarea,
    Checkbox,
    FormLabel,
    Center,
    Text,
    Container,
    CardFooter,
} from "@chakra-ui/react";
import { useToast, Icon } from "@chakra-ui/react";
import { FaPaste, FaDownload, FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import * as htmlToImage from "html-to-image";
import { capitalizeWords, getVideoResolution, getInstagramShortcode, hashtag } from "../config";
import { Roboto } from "next/font/google";

const roboto = Roboto({
    weight: "700",
    subsets: ["latin"],
});

interface IMedia {
    url: string;
    title: string;
}


export default function Page() {
    const router = useRouter();
    const toast = useToast();
    const xRapidApiKey = "d1b694d66amsh95321ca4e2c7b58p1b30eajsn93ea0bad3230";
    const cloud_name = 'dh1sqyt2q'

    const [url, setUrl] = useState("");
    const [caption, setCaption] = useState("");
    const [originalCaption, setOriginalCaption] = useState("");
    const [owner, setOwner] = useState("");
    const [media, setMedia] = useState<IMedia[]>([]);
    const [repost, setRepost] = useState(true);
    const [title, setTitle] = useState(``);
    const [videoUrl, setVideoUrl] = useState('')
    const [videoWidth, setVideoWidth] = useState(0)
    const [videoFile, setVideoFile] = useState<File>();
    const [public_id, setPublicId] = useState('');
    const [isDisable, setIsDisable] = useState(true);

    const showToast = useCallback(
        async (title: string, iStatus: number, message: string) => {
            const listStatus = ["success", "error", "warning", "info", "loading"] as const;

            toast({
                title: title,
                description: message,
                status: listStatus[iStatus],
                duration: 9000,
                isClosable: true,
                position: "bottom-left",
            });
        },
        [toast]
    );

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
                setVideoWidth(width - 50)
            })
            .catch((error) => {
                console.error(error);
            });
    }

    const onRepostChange = (e: ChangeEvent<HTMLInputElement>) => {
        setRepost(e.target.checked);

        if (e.target.checked) {
            setCaption(`${originalCaption}\n\nRepost : @${owner}\n\n${hashtag.join(" ")}`);
        } else {
            setCaption(`${originalCaption}\n\n${hashtag.join(" ")}`);
        }
    };

    const copy = () => {
        navigator.clipboard.writeText(caption);
        showToast("Success", 0, "Copied to cliboard");
    };

    const paste = async () => {
        try {
            // Check if the browser supports the Clipboard API
            if (navigator.clipboard && typeof navigator.clipboard.readText === "function") {
                // Use the Clipboard API to read text from the clipboard
                const text = await navigator.clipboard.readText();
                setUrl(text);
            } else {
                showToast("Error", 1, "Clipboard API is not supported in this browser.");
            }
        } catch (e) {
            showToast("Error", 1, (e as Error).message);
        }
    };

    const submit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        toast({
            title: "Please wait",
            description: "Preparing media and thumbnail...",
            status: "loading",
            duration: null,
        });

        const shortcode = getInstagramShortcode(url);
        const apiRapid = `https://instagram-scraper-api2.p.rapidapi.com/v1/post_info?code_or_id_or_url=${shortcode}&include_insights=true`;

        try {
            const response = await fetch(apiRapid, {
                method: "GET",
                headers: {
                    "x-rapidapi-key": xRapidApiKey, // Include your token here
                },
            });
            const res = await response.json();
            const data = res.data;

            const links: IMedia[] = [];

            if (data.carousel_media === undefined) {
                if (data.is_video) {
                    links.push({
                        url: `${data.video_versions[0].url}&dl=1`,
                        title: "Download Video",
                    });
                }
            } else {
                let i = 1;
                for (const dt of data.carousel_media) {
                    if (dt.is_video) {
                        links.push({
                            url: `${dt.video_versions[0].url}&dl=1`,
                            title: `Download Slide #${i}`,
                        });
                    } else {
                        links.push({
                            url: `${dt.thumbnail_url}&dl=1`,
                            title: `Download Slide #${i}`,
                        });
                    }
                    i++;
                }
            }

            links.push({
                url: `${data.thumbnail_url}&dl=1`,
                title: `Download Thumbnail`,
            });

            setOriginalCaption(data.caption.text);
            setOwner(data.user.username);
            setMedia(links);

            if (repost) {
                setCaption(`${data.caption.text}\n\nRepost : @${data.user.username}\n\n${hashtag.join(" ")}`);
            } else {
                setCaption(`${data.caption.text}\n\n${hashtag.join(" ")}`);
            }

            toast.closeAll();
        } catch (e) {
            toast.closeAll();
            showToast("Error", 1, (e as Error).message);
        }
    };

    const uploadToCloudinary = async (file: File, public_id: string) => {
        const formData = new FormData();
        formData.append('file', file); // File yang akan diunggah
        formData.append('upload_preset', 'video-upload-preset');
        formData.append('public_id', public_id);

        try {
            // Kirim permintaan unggahan ke Cloudinary
            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/video/upload`, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                showToast("Error", 1, "Upload failed")
                console.error('Upload failed:', result);
            }

        } catch (e) {
            showToast("Error", 1, (e as Error).message)
        }
    }

    const render = async () => {
        toast({
            title: "Please wait",
            description: "Rendering video...",
            status: "loading",
            duration: null,
        });

        try {
            setIsDisable(true)
            const public_id = `video_${Date.now()}`
            uploadToCloudinary(videoFile as File, public_id);

            const fd = new FormData();
            fd.append('public_id', public_id);
            fd.append('videoWidth', videoWidth.toString());

            const element = document.getElementById("canvas");

            if (element) {
                const dataUrl = await htmlToImage.toPng(element, {
                    style: {
                        border: "none", // Hapus border jika ada
                        margin: "0", // Hapus margin jika ada
                    },
                });

                const blob = new Blob([dataUrl], { type: 'image/png' });
                fd.append('title', blob, 'image.png');
            }

            const res = await fetch(`/api/cloudinary`, { method: 'POST', body: fd });
            const data = await res.json();

            console.log(data)

            if (data.success) {
                setVideoUrl(data.url)
                setPublicId(data.public_id)
                setIsDisable(false)
                toast.closeAll();
            } else {
                toast.closeAll()
                toast({
                    title: "Error",
                    description: data.error,
                    status: "error",
                    duration: null,
                });
            }

        } catch (error) {
            console.log(error)
        }

    }

    const download = async () => {
        try {
            toast.closeAll()
            toast({
                title: "Please wait",
                description: "Downloading video...",
                status: "loading",
                duration: null,
            });

            const response = await fetch(videoUrl);

            // Periksa apakah permintaan berhasil
            if (!response.ok) {
                toast.closeAll()
                showToast("Error", 1, `Failed. Please try again in few seconds`)
                return;
            }

            // Konversi respons menjadi Blob
            const blob = await response.blob();

            // Buat URL objek dari Blob
            const url = window.URL.createObjectURL(blob);

            // Buat elemen <a> untuk tautan unduhan
            const a = document.createElement('a');
            a.href = url;
            a.download = `${public_id}.mp4`; // Nama file hasil download
            document.body.appendChild(a);
            a.click();

            // Bersihkan elemen <a> dan URL objek setelah unduhan
            a.remove();
            window.URL.revokeObjectURL(url);

            toast.closeAll()
            console.log('Video berhasil didownload.');
        } catch (e) {
            toast.closeAll()
            showToast("Error", 1, (e as Error).message)
        }
    }


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
                            <form onSubmit={(e: FormEvent<HTMLFormElement>) => submit(e)}>
                                <FormControl>
                                    <InputGroup>
                                        <Input
                                            type="text"
                                            value={url}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
                                            placeholder="Paste URL Instagram"
                                        />
                                        <InputRightElement>
                                            <Button onClick={paste}>
                                                <Icon as={FaPaste} color="#493628" />
                                            </Button>
                                        </InputRightElement>
                                    </InputGroup>
                                    <Button type="submit" leftIcon={<FaDownload />} colorScheme="teal" size="sm" mt={4} width="100%">
                                        GET DATA
                                    </Button>
                                </FormControl>
                            </form>
                            {media.length > 0 && (
                                <Box mt={4} p={4} display={{ md: "flex" }}>


                                    <VStack ml={{ md: 4 }}>
                                        {media.map((item, index) => (
                                            <Button
                                                key={index}
                                                size="sm"
                                                colorScheme="teal"
                                                width="100%"
                                                onClick={() => router.push(item.url)}
                                            >
                                                {item.title}
                                            </Button>
                                        ))}
                                    </VStack>
                                </Box>
                            )}
                        </CardBody>
                    </Card>
                    <Card>
                        <CardHeader>
                            <Flex>
                                <Button onClick={copy} colorScheme="teal" size="sm" disabled={caption ? false : true}>
                                    Copy Caption
                                </Button>
                                <Spacer />
                                <Checkbox defaultChecked onChange={(e) => onRepostChange(e)}>
                                    Include Repost
                                </Checkbox>
                            </Flex>
                        </CardHeader>
                        <CardBody>
                            <Textarea
                                value={caption}
                                style={{ whiteSpace: "pre-wrap" }}
                                size="sm"
                                rows={caption ? 10 : 3}
                                onChange={(e) => {
                                    setCaption(e.target.value);
                                }}
                            />
                        </CardBody>
                    </Card>
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
                            {title !== "" && (
                                <Center id="canvas" style={{ position: "relative", height: 150, }}>
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
                            <Button onClick={() => setTitle(capitalizeWords(title))} colorScheme="teal" size="sm" mt={4} ml={1}>
                                Capitalize
                            </Button>
                            <Button onClick={render} colorScheme="teal" size="sm" mt={4} ml={1}>
                                Render
                            </Button>
                        </CardBody>
                        <CardFooter>
                            <SimpleGrid>
                                <Button onClick={download} colorScheme="teal" size="sm" disabled={isDisable} width="100%">
                                    Download
                                </Button>
                                <Text textAlign="center" mt={2}>If the button does not work, please try again in few seconds</Text>
                            </SimpleGrid>
                        </CardFooter>
                    </Card>
                </SimpleGrid>
            </Box>
        </VStack>
    )
}