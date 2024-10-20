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
  Text,
  Link,
  Flex,
  Spacer,
  VStack,
  Image,
  StackDivider,
  IconButton,
  HStack,
} from "@chakra-ui/react";
import { Icon, useToast } from "@chakra-ui/react";
import { FaPaste, FaDownload, FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";

interface IMedia {
  id: number;
  is_video: boolean;
  url: string;
  title: string;
}

export default function Page() {
  const [url, setUrl] = useState("");
  const [embed, setEmbed] = useState("");
  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState<IMedia[]>([]);

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

      // get data from local json
      // const res = await fetch(`/api/carousel`);
      // const result = await res.json();
      // const data = result.result;

      const links: IMedia[] = [];
      if (data.carousel_media === undefined) {
        if (data.is_video) {
          links.push({
            id: data.caption.id,
            is_video: data.is_video,
            url: data.video_url,
            title: "Download Video",
          });
        } else {
          links.push({
            id: data.caption.id,
            is_video: data.is_video,
            url: data.thumbnail_url,
            title: "Download Image",
          });
        }
      } else {
        let i = 1;
        for (const dt of data.carousel_media) {
          if (dt.is_video) {
            links.push({
              id: dt.pk,
              is_video: dt.is_video,
              url: dt.video_url,
              title: `Download Slide #${i}`,
            });
          } else {
            links.push({
              id: dt.pk,
              is_video: data.is_video,
              url: dt.thumbnail_url,
              title: `Download Slide #${i}`,
            });
          }
          i++;
        }
      }

      const hashtag = "#planetdenpasar #planetkitabali";
      setEmbed(`https://www.instagram.com/p/${shortcode}/embed`);
      setCaption(`${data.caption.text} \n\n ${hashtag}`);
      setMedia(links);
      console.log(links);
      toast.closeAll();
    } catch (e) {
      toast({
        description: (e as Error).message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(caption);
    toast({
      description: "Copied to cliboard",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  };

  const paste = async () => {
    try {
      // Check if the browser supports the Clipboard API
      if (navigator.clipboard && typeof navigator.clipboard.readText === "function") {
        // Use the Clipboard API to read text from the clipboard
        const text = await navigator.clipboard.readText();
        setUrl(text);
      } else {
        toast({
          description: "Clipboard API is not supported in this browser.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (e) {
      toast({
        description: (e as Error).message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // const download = (media: IMedia) => {
  //   showToast("Loading", 4, "Please wait...");
  //   const xhr = new XMLHttpRequest();
  //   xhr.open("GET", media.url, true);
  //   xhr.responseType = "blob";
  //   xhr.onload = function () {
  //     const urlCreator = window.URL || window.webkitURL;
  //     const imageUrl = urlCreator.createObjectURL(this.response);
  //     const ext = media.is_video ? "mp4" : "jpg";
  //     const tag = document.createElement("a");
  //     tag.href = imageUrl;
  //     tag.target = "_blank";
  //     tag.download = `${media.id}.${ext}`;
  //     document.body.appendChild(tag);
  //     tag.click();
  //     document.body.removeChild(tag);
  //   };
  //   xhr.onerror = () => {
  //     showToast("Error", 1, "Failed to download media");
  //   };
  //   xhr.send();
  //   toast.closeAll();
  //   showToast("Success", 0, "File downloaded successfully");
  // };

  const downloadMedia = async (media: IMedia) => {
    try {
      showToast("Loading", 4, "Please wait...");

      // Fetch the file from the given URL
      const response = await fetch(media.url);

      // Check if the response is OK (status code 200)
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }

      // Get the file data as a blob
      const blob = await response.blob();

      // Create a URL for the blob
      const blobUrl = window.URL.createObjectURL(blob);

      // Create an anchor element and set the blob URL as the href
      const a = document.createElement("a");
      a.href = blobUrl;
      const ext = media.is_video ? "mp4" : "jpg";
      a.download = `${media.id}.${ext}`;

      // Append the anchor to the document and trigger a download
      document.body.appendChild(a);
      a.click();

      // Remove the anchor and revoke the blob URL
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      toast({
        description: (e as Error).message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const downloadAll = (list_media: IMedia[]) => {
    for (const media of list_media) {
      downloadMedia(media);
    }
  };

  // async function downloadFile(blobData: any, id: string, ext: string) {
  //   const blob = new Blob([blobData]);
  //   const link = document.createElement("a");
  //   link.href = URL.createObjectURL(blob);
  //   link.download = `${id}.${ext}`;
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  //   URL.revokeObjectURL(link.href);
  // }

  // const downloadAPI = async (media: IMedia) => {
  //   const fd = new FormData();
  //   fd.append("url", media.url);
  //   const res = await fetch(`/api/download`, { method: "POST", body: fd });

  //   if (res.ok) {
  //     const data = await res.json();
  //     const ext = media.is_video ? "mp4" : "jpg";
  //     downloadFile(data.blob, `${media.id}`, ext); // Or jpg based on the file type
  //   }
  // };

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
            onClick={() => router.back()}
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
                      <Link
                        fontSize="sm"
                        key={index}
                        mt={2}
                        display="block"
                        bg="teal"
                        color="white"
                        onClick={() => {
                          downloadMedia(item);
                        }}
                        p={2}
                        textAlign="center"
                        borderRadius={6}
                      >
                        {item.title}
                      </Link>
                    ))}

                    {media.length > 1 && (
                      <Link
                        fontSize="sm"
                        fontWeight="bold"
                        mt={2}
                        display="block"
                        bg="teal"
                        color="white"
                        onClick={() => {
                          downloadAll(media);
                        }}
                        p={2}
                        textAlign="center"
                        borderRadius={6}
                      >
                        Download All
                      </Link>
                    )}
                  </Box>
                </Box>
              )}
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <Flex>
                <Heading size="sm">Caption</Heading>
                <Spacer />
                <Button onClick={copy} colorScheme="teal" size="sm" disabled={caption ? false : true}>
                  Copy Caption
                </Button>
              </Flex>
            </CardHeader>
            <CardBody>
              <Text fontSize="sm" style={{ whiteSpace: "pre-wrap", textAlign: "justify" }} p={4} bg="gray.100">
                {caption}
              </Text>
            </CardBody>
          </Card>
        </SimpleGrid>
      </Box>
    </VStack>
  );
}
