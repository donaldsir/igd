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
    Heading,
    Flex,
    Spacer,
    VStack,
    Image,
    StackDivider,
    IconButton,
    HStack,
    Textarea,
    Checkbox
} from "@chakra-ui/react";
import { Icon, useToast } from "@chakra-ui/react";
import { FaPaste, FaDownload, FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";

interface IMedia {
    url: string;
    title: string;
}

export default function Page() {
    const [url, setUrl] = useState("");
    const [embed, setEmbed] = useState("");
    const [caption, setCaption] = useState("");
    const [originalCaption, setOriginalCaption] = useState("")
    const [owner, setOwner] = useState("");
    const [media, setMedia] = useState<IMedia[]>([]);
    const [repost, setRepost] = useState(true)

    const hashtag = ['#planetdenpasar', '#planetkitabali', '#bali', '#infonetizenbali', '#infosemetonbali',]

    const router = useRouter();
    const toast = useToast();
    // const accessToken = "IGQWRQOTZAPUlpXdGgxMDgwV283Nk5fVDJ2NTZAwX081UVNCLXFneDYyUEJmMWZAyODFtQTRTTWRHbVlyS041YW55MThIQUlLWU9ZANGZAsMnI4eXJUckdGV3pyMnZAQUGMzOEhyWnhhbjUzY2dIZA1FGMUMxN3RTc3BHX2sZD"

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

    const getInstagramShortcode = () => {
        const regex = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel)\/([A-Za-z0-9-_]+)/;
        const match = url.match(regex);
        if (match && match[1]) {
            return match[1];
        } else {
            return null; // Return null if no shortcode is found
        }
    };

    const onRepostChange = (e: ChangeEvent<HTMLInputElement>) => {
        setRepost(e.target.checked)

        if (e.target.checked) {
            setCaption(`${originalCaption}\n\nRepost : @${owner}\n\n${hashtag.join(' ')}`);
        } else {
            setCaption(`${originalCaption}\n\n${hashtag.join(' ')}`);
        }
    }

    const submit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        showToast("Loading", 4, "Please wait...");
        const shortcode = getInstagramShortcode();
        const apiRapid = `https://instagram-scraper-api2.p.rapidapi.com/v1/post_info?code_or_id_or_url=${shortcode}-&include_insights=true`;

        try {
            const response = await fetch(apiRapid, {
                method: "GET",
                headers: {
                    "x-rapidapi-key": `3ab2799145msh117680a9dd1be7fp17da44jsn64b3358ca745`, // Include your token here
                },
            });
            const res = await response.json();
            const data = res.data;

            const links: IMedia[] = [];
            if (data.carousel_media === undefined) {
                if (data.is_video) {
                    links.push({
                        url: `${data.video_url}&dl=1`,
                        title: "Download Video",
                    });
                } else {
                    links.push({
                        url: `${data.thumbnail_url}&dl=1`,
                        title: "Download Image",
                    });
                }
            } else {
                let i = 1;
                for (const dt of data.carousel_media) {
                    if (dt.is_video) {
                        links.push({
                            url: `${dt.video_url}&dl=1`,
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

            setEmbed(`https://www.instagram.com/p/${shortcode}/embed`);
            setOriginalCaption(data.caption.text)
            setOwner(data.owner.username)
            setMedia(links);

            if (repost) {
                setCaption(`${data.caption.text}\n\nRepost : @${data.owner.username}\n\n${hashtag.join(' ')}`);
            } else {
                setCaption(`${data.caption.text}\n\n${hashtag.join(' ')}`);
            }

            toast.closeAll();
        } catch (e) {
            toast.closeAll();
            showToast("Error", 1, (e as Error).message)
        }
    };

    const copy = () => {
        navigator.clipboard.writeText(caption);
        showToast("Success", 0, "Copied to cliboard")
    };

    const paste = async () => {
        try {
            // Check if the browser supports the Clipboard API
            if (navigator.clipboard && typeof navigator.clipboard.readText === "function") {
                // Use the Clipboard API to read text from the clipboard
                const text = await navigator.clipboard.readText();
                setUrl(text);
            } else {
                showToast("Error", 1, "Clipboard API is not supported in this browser.")
            }
        } catch (e) {
            showToast("Error", 1, (e as Error).message)
        }
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
                        onClick={() => router.push('/')}
                    />
                    <Spacer />
                    <Image src="/images/logo-text.png" w={100} alt="logo" />
                </HStack>
            </Box>
            <Box>
                <SimpleGrid columns={{ md: 2, sm: 1 }} m={4} spacing={8}>
                    <Card>
                        <CardHeader>
                            <Heading size="sm">URL</Heading>
                        </CardHeader>
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
                                        DOWNLOAD
                                    </Button>


                                </FormControl>
                            </form>
                            {media.length > 0 && (
                                <Box mt={4} p={4} display={{ md: "flex" }}>
                                    <Box flexShrink={0}>
                                        <iframe src={embed} height={450} />
                                    </Box>
                                    <Box mt={{ base: 4, md: 0 }} ml={{ md: 6 }}>
                                        {media.map((item, index) => (
                                            <Button
                                                size="sm"
                                                key={index}
                                                mt={2}
                                                colorScheme="teal"
                                                onClick={() => router.push(item.url)}
                                            >
                                                {item.title}
                                            </Button>
                                        ))}

                                    </Box>
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
                                size='sm'
                                rows={caption ? 30 : 3}
                                onChange={(e) => { setCaption(e.target.value) }}
                            />
                        </CardBody>
                    </Card>
                </SimpleGrid>
            </Box>
        </VStack>
    );
}
