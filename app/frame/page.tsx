"use client";
import { useState, FormEvent, useCallback } from "react";
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
} from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import { FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import * as htmlToImage from "html-to-image";

export default function Page() {
  const router = useRouter();
  const toast = useToast();

  const [gambar, setGambar] = useState("");
  const [title, setTitle] = useState(``);
  const [lines, setLines] = useState<string[]>([]);

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

  // const randomSentence = useCallback((maxLength: number = 120): string => {
  //     // Define a list of words to choose from
  //     const words: string[] = [
  //         "the", "quick", "brown", "fox", "jumps", "over", "lazy", "dog",
  //         "lorem", "ipsum", "dolor", "sit", "amet", "consectetur",
  //         "adipiscing", "elit", "sed", "do", "eiusmod", "tempor",
  //         "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua",
  //         "ut", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  //         "exercitation", "ullamco", "laboris", "nisi", "ut", "aliquip",
  //         "ex", "ea", "commodo", "consequat", "duis", "aute", "irure",
  //         "dolor", "in", "reprehenderit", "in", "voluptate", "velit",
  //         "esse", "cillum", "dolore", "eu", "fugiat", "nulla", "pariatur",
  //         "excepteur", "sint", "occaecat", "cupidatat", "non", "proident",
  //         "sunt", "in", "culpa", "qui", "officia", "deserunt", "mollit",
  //         "anim", "id", "est", "laborum"
  //     ];

  //     let sentence = '';

  //     // Continue adding words until the sentence reaches the maximum length
  //     while (true) {
  //         // Randomly select a word from the list
  //         const word = words[Math.floor(Math.random() * words.length)];

  //         // Check if adding the next word exceeds the max length
  //         if (sentence.length + word.length + 1 > maxLength) {
  //             break; // Stop if the next word would exceed max length
  //         }

  //         // Add the word to the sentence
  //         sentence += (sentence ? ' ' : '') + word; // Add space if not the first word
  //     }

  //     // Capitalize the first letter and add a period at the end
  //     sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';

  //     return sentence;
  // }, [toast, showToast]);

  // useEffect(() => {
  //     setTitle(randomSentence());
  // }, [randomSentence]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimTitle = title.trim();
    if (trimTitle.length > 120) {
      showToast("Error", 1, `Title is too long (maximum is 120 characters)`);
      return;
    }

    const arrTitle = trimTitle.split(" ");
    let numRow = 0;
    let start = arrTitle.length - 1;
    const titles = [];

    while (numRow < 4) {
      let currLength = 0;
      const singleLine = [];
      let space = 1;
      for (let i = start; i >= 0; i--) {
        const newLength = currLength + arrTitle[i].length + space;

        if (i === 0) {
          singleLine.push(arrTitle[i].toUpperCase());
          singleLine.reverse();
          titles.push(singleLine.join(" "));
          numRow = 4;
        } else {
          if (newLength <= 34) {
            singleLine.push(arrTitle[i].toUpperCase());
            space++;
            currLength = newLength;
          } else {
            singleLine.reverse();
            titles.push(singleLine.join(" "));
            start = i;
            break;
          }
        }
      }
      numRow++;
    }

    setLines(titles);
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
              <form onSubmit={(e: FormEvent<HTMLFormElement>) => submit(e)}>
                <FormControl>
                  <FormLabel>Image</FormLabel>
                  <Input type="file" size="sm" onChange={(e) => onChangeFile(e)} />
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>
                    Title <span style={{ color: "red", fontSize: 14 }}>({`${title.trim().length}/120`})</span>
                  </FormLabel>
                  <Textarea
                    value={title}
                    style={{ whiteSpace: "pre-wrap" }}
                    size="sm"
                    rows={3}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </FormControl>
                <Button type="submit" colorScheme="teal" size="sm" mt={4}>
                  Create Text
                </Button>
                <Button
                  onClick={() => download("canvas", createFileName())}
                  colorScheme="teal"
                  size="sm"
                  mt={4}
                  ml={1}
                  disabled={gambar ? false : true}
                >
                  Download Result
                </Button>
              </form>
            </CardBody>
          </Card>
          <Center id="canvas" style={{ position: "relative", width: 400, height: 500 }}>
            <Image
              src="/images/logo-pd-stroke.png"
              w={100}
              style={{ position: "absolute", top: 10, right: 10 }}
              alt="logo white"
            />
            <Image src={gambar ? gambar : "/images/no-image.jpg"} w={400} h={500} fit="cover" alt="media" />
            <Box
              style={{ position: "absolute", bottom: 0 }}
              bg="linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 80%)"
              w="100%"
              h={70 * lines.length}
            />
            {lines.map((item, index) => (
              <Text
                key={index}
                style={{ position: "absolute", top: 430 - 37 * index }}
                bg="#148b9d"
                color="white"
                fontWeight="medium"
                fontSize={21.7}
                px={1}
              >
                {item}
              </Text>
            ))}
          </Center>
        </SimpleGrid>
      </Box>
    </VStack>
  );
}
