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
  CardFooter,
  Divider,
} from "@chakra-ui/react";
import { Icon, useToast } from "@chakra-ui/react";
import { FaPaste, FaDownload, FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function Page() {
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [id, setId] = useState("");
  const [originalCaption, setOriginalCaption] = useState("");
  const [urlMedia, setUrlMedia] = useState("");
  const [repost, setRepost] = useState(true);
  const [owner, setOwner] = useState("");

  const router = useRouter();
  const toast = useToast();
  const hashtag = ["#planetdenpasar", "#planetkitabali", "#infonetizenbali", "#infosemetonbali", "#bali"];
  const xRapidApiKey = "d1b694d66amsh95321ca4e2c7b58p1b30eajsn93ea0bad3230";

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

  const copy = () => {
    navigator.clipboard.writeText(caption);
    showToast("Success", 0, "Copied to cliboard");
  };

  const onRepostChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRepost(e.target.checked);

    if (e.target.checked) {
      setCaption(`${originalCaption}\n\nRepost X : ${owner}\n\n${hashtag.join(" ")}`);
    } else {
      setCaption(`${originalCaption}\n\n${hashtag.join(" ")}`);
    }
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    showToast("Loading", 4, "Please wait...");
    const tweet_id = url.match("[0-9]{10,20}");
    const apiRapid = `https://twitter-api45.p.rapidapi.com/tweet.php?id=${tweet_id}`;

    try {
      const response = await fetch(apiRapid, {
        method: "GET",
        headers: {
          "x-rapidapi-key": xRapidApiKey, // Include your token here
        },
      });
      const data = await response.json();

      setId(tweet_id ? tweet_id.toString() : "");
      setOriginalCaption(data.display_text);
      setUrlMedia(`${data.media.video[0].variants[3].url}`);
      setOwner(data.author.screen_name);

      if (repost) {
        setCaption(`${data.display_text}\n\nRepost X : ${data.author.screen_name}\n\n${hashtag.join(" ")}`);
      } else {
        setCaption(`${data.display_text}\n\n${hashtag.join(" ")}`);
      }
      toast.closeAll();
    } catch (e) {
      showToast("Error", 1, (e as Error).message);
    }
  };

  const download = async () => {
    showToast("Loading", 4, "Please wait...");
    try {
      const response = await fetch(urlMedia);
      if (!response.ok) {
        throw new Error(`Failed to fetch video: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);

      // Create a temporary anchor element for download
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `X_${id}.mp4`;
      a.style.display = "none";

      // Append anchor to body, click it to start download, then remove it
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Release the blob URL after download
      URL.revokeObjectURL(downloadUrl);
      console.log("Download complete.");
      toast.closeAll();
    } catch (e) {
      toast.closeAll();
      showToast("Error", 1, (e as Error).message);
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
                      placeholder="Paste URL X Video"
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
              <Divider orientation="horizontal" m={2} />
              {urlMedia && (
                <Button size="sm" colorScheme="teal" p={2} w="100%" onClick={() => download()}>
                  Download Video
                </Button>
              )}
            </CardBody>
            <CardFooter></CardFooter>
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
                rows={caption ? 30 : 3}
                onChange={(e) => {
                  setCaption(e.target.value);
                }}
              />
            </CardBody>
          </Card>
        </SimpleGrid>
      </Box>
    </VStack>
  );
}
