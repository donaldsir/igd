"use client";
import { useState, useCallback } from "react";
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
  Container
} from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import { FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import * as htmlToImage from "html-to-image";
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

  const onChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    const selectedFiles = files as FileList;

    const blob = new Blob([selectedFiles?.[0]]);
    const imgsrc = URL.createObjectURL(blob);

    const img = new window.Image();

    img.src = imgsrc;

    setGambar(imgsrc);
  };

  // const randomSentence = useCallback((maxLength: number = 100): string => {
  //   let sentence = '';

  //   // Continue adding words until the sentence reaches the maximum length
  //   while (true) {
  //     // Randomly select a word from the list
  //     const word = words[Math.floor(Math.random() * words.length)];

  //     // Check if adding the next word exceeds the max length
  //     if (sentence.length + word.length + 1 > maxLength) {
  //       break; // Stop if the next word would exceed max length
  //     }

  //     // Add the word to the sentence
  //     sentence += (sentence ? ' ' : '') + word; // Add space if not the first word
  //   }

  //   // Capitalize the first letter and add a period at the end
  //   sentence = sentence.charAt(0) + sentence.slice(1);

  //   return sentence;
  // }, [toast, showToast]);

  // useEffect(() => {
  //   setTitle(randomSentence());
  // }, [randomSentence]);


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
      showToast("Error", 1, `Element with id "${elementId}" not found.`);
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
                <FormLabel>Image</FormLabel>
                <Input type="file" accept="image/*" size="sm" onChange={(e) => onChangeFile(e)} />
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
                onClick={() => download("canvas", createFileName())}
                colorScheme="teal"
                size="sm"
                mt={4}
                ml={1}
              >
                Download Result
              </Button>
            </CardBody>
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
  );
}
