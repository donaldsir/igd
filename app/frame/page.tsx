"use client";
import { useState, FormEvent, useCallback, useEffect } from "react";
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
import { Roboto } from 'next/font/google'
import { dimensiAlfabet } from "../config";

const roboto = Roboto({
  weight: '700',
  subsets: ['latin'],
})

export default function Page() {
  const router = useRouter();
  const toast = useToast();

  const [gambar, setGambar] = useState("");
  const [title, setTitle] = useState(`Meutya Buka Peluang Polisi`);
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

  const randomSentence = useCallback((maxLength: number = 100): string => {
    // Define a list of words to choose from
    const words: string[] = [
      "the", "quick", "brown", "fox", "jumps", "over", "lazy", "dog",
      "lorem", "ipsum", "dolor", "sit", "amet", "consectetur",
      "adipiscing", "elit", "sed", "do", "eiusmod", "tempor",
      "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua",
      "ut", "enim", "ad", "minim", "veniam", "quis", "nostrud",
      "exercitation", "ullamco", "laboris", "nisi", "ut", "aliquip",
      "ex", "ea", "commodo", "consequat", "duis", "aute", "irure",
      "dolor", "in", "reprehenderit", "in", "voluptate", "velit",
      "esse", "cillum", "dolore", "eu", "fugiat", "nulla", "pariatur",
      "excepteur", "sint", "occaecat", "cupidatat", "non", "proident",
      "sunt", "in", "culpa", "qui", "officia", "deserunt", "mollit",
      "anim", "id", "est", "laborum"
    ];

    let sentence = '';

    // Continue adding words until the sentence reaches the maximum length
    while (true) {
      // Randomly select a word from the list
      const word = words[Math.floor(Math.random() * words.length)];

      // Check if adding the next word exceeds the max length
      if (sentence.length + word.length + 1 > maxLength) {
        break; // Stop if the next word would exceed max length
      }

      // Add the word to the sentence
      sentence += (sentence ? ' ' : '') + word; // Add space if not the first word
    }

    // Capitalize the first letter and add a period at the end
    sentence = sentence.charAt(0) + sentence.slice(1) + '.';

    return sentence;
  }, [toast, showToast]);

  useEffect(() => {
    setTitle(randomSentence());
  }, [randomSentence]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimTitle = capitalizeFirstLetter(title.trim());
    if (trimTitle.length > 110) {
      showToast("Error", 1, `Title is too long (maximum is 110 characters)`);
      return;
    }

    console.log(textWidth("consequat esse dolor commodo"))
    setLines(splitText(trimTitle))
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

  const capitalizeFirstLetter = (text: string) => {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  const textWidth = (text: string) => {
    let totalWidth = 0;

    for (const char of text) {
      const dimensi = dimensiAlfabet.find(d => d.huruf === char);
      if (dimensi) {
        totalWidth += dimensi.panjang;
      }
    }

    return totalWidth;
  }

  const splitText = (text: string) => {
    const hasil: string[] = [];
    const kataArray = text.split(" "); // Memecah kalimat menjadi array kata

    let kalimatBagian = "";
    let totalPanjang = 0;
    const spaceWidth = textWidth(" ")

    for (const kata of kataArray) {
      let kataPanjang = 0;

      // Hitung panjang kata
      for (const char of kata) {
        const dimensi = dimensiAlfabet.find(d => d.huruf === char);
        if (dimensi) {
          kataPanjang += dimensi.panjang;
        }
      }

      // Cek apakah menambahkan kata ini melebihi batas panjang
      if (totalPanjang + kataPanjang > 330) {
        // Jika ya, tambahkan bagian kalimat ke hasil dan mulai bagian baru
        hasil.push(kalimatBagian.trim());
        kalimatBagian = kata; // Mulai kalimat baru dengan kata ini
        totalPanjang = kataPanjang; // Reset total panjang
      } else {
        // Jika tidak, tambahkan kata ke bagian kalimat
        kalimatBagian += (kalimatBagian ? " " : "") + kata; // Menambahkan spasi jika sudah ada kata
        totalPanjang += kataPanjang;
      }
    }

    // Tambahkan bagian terakhir jika ada
    if (kalimatBagian) {
      hasil.push(kalimatBagian.trim());
    }

    return hasil.reverse();
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
                  <FormLabel>Image</FormLabel>
                  <Input type="file" accept="image/*" size="sm" onChange={(e) => onChangeFile(e)} />
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>
                    Title <span style={{ color: "red", fontSize: 14 }}>({`${title.trim().length}/110`})</span>
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
              src="/images/logo-pd.png"
              w={100}
              style={{ position: "absolute", top: 20 }}
              alt="logo white"
            />
            <Image src={gambar ? gambar : "/images/no-image.jpg"} w={400} h={500} fit="cover" alt="media" />
            <Box
              style={{ position: "absolute", bottom: 50, boxShadow: '5px 5px #148b9d' }}
              bg="rgba(255,255,255,0.7)"
              w="85%"
              h={45 * lines.length}
            />
            {lines.map((item, index) => (
              <Text
                key={index}
                style={{ position: "absolute", top: 400 - 37 * index }}
                fontSize={24}
                px={1}
                className={roboto.className}
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
