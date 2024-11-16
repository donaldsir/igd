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
import { Roboto } from "next/font/google";
import { dateMySql } from "../config";

const roboto = Roboto({
  weight: "500",
  subsets: ["latin"],
});

interface iDetail {
  tanggal: "string";
  lokasi: "string";
  waktu: "string";
}

interface iSIM {
  polresta_denpasar: Array<iDetail>;
  polres_badung: Array<iDetail>;
}

interface iJadwal {
  nama: string;
  lokasi: string;
  waktu: string;
}

export default function Page() {
  const router = useRouter();
  const toast = useToast();

  const [json, setJson] = useState<iSIM>();
  const [jadwalSIM1, setJadwalSIM1] = useState<Array<iJadwal>>([]);
  const [jadwalSIM2, setJadwalSIM2] = useState<Array<iJadwal>>([]);
  const [top1, setTop1] = useState(0);
  const [tanggal, setTanggal] = useState(dateMySql(new Date()));
  const [title, setTitle] = useState(``);

  useEffect(() => {
    async function fetchData() {
      try {
        // Mengambil data dari file JSON yang ada di public
        const response = await fetch("/json/sim.json");
        const result = await response.json();
        setJson(result); // Menyimpan data JSON ke state
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData(); // Panggil fungsi untuk memuat data
  }, []);

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr); // Mengonversi string ke objek Date

    // Format tanggal sesuai dengan lokal Indonesia
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
    };

    // Format tanggal menggunakan Intl.DateTimeFormat
    const formatter = new Intl.DateTimeFormat("id-ID", options);
    return formatter.format(date);
  }

  function formatString(input: string): string {
    return input
      .replace(/_/g, " ") // Ganti underscore (_) dengan spasi
      .toUpperCase(); // Ubah semua karakter menjadi huruf besar
  }

  function getDayFromDate(date: string | Date): string {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    // Parse the input date
    const parsedDate = typeof date === "string" ? new Date(date) : date;

    // Ensure it's a valid date
    if (isNaN(parsedDate.getTime())) {
      throw new Error("Invalid date format");
    }

    // Get the day of the week
    return days[parsedDate.getDay()];
  }

  const filter = () => {
    let jadwal1: Array<iJadwal> = [];
    let jadwal2: Array<iJadwal> = [];
    const dtFormat = formatDate(tanggal);

    if (getDayFromDate(tanggal) !== "Sunday") {
      jadwal1.push({
        nama: "POLRESTA DENPASAR",
        lokasi: "Polresta Denpasar",
        waktu: "08:00 WITA s/d selesai",
      });
    }

    let i = 0;
    for (var key in json) {
      const array = json[key as keyof iSIM];
      const filter = array.filter((array) => array.tanggal === dtFormat);

      if (filter.length > 0) {
        const dt = {
          nama: formatString(key),
          lokasi: filter[0].lokasi,
          waktu: filter[0].waktu,
        };

        if (jadwal1.length < 5) {
          jadwal1.push(dt);
        } else {
          jadwal2.push(dt);
        }
      }
    }

    let topJadwal1 = 100 + (5 - jadwal1.length) * 20;

    setJadwalSIM1(jadwal1);
    setJadwalSIM2(jadwal2);
    setTop1(topJadwal1);
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
                <FormLabel>Date</FormLabel>
                <Input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
              </FormControl>
              <Button onClick={filter} colorScheme="teal" size="sm" mt={4} ml={1}>
                Get Data
              </Button>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Center id="canvas1" style={{ position: "relative", width: 340 }}>
                <Image src={"/images/sim.jpg"} w={340} fit="cover" alt="media" />
                <Center style={{ position: "absolute" }} bg="#e21e1f" py={1} px={2} rounded={10} top={3} left={4}>
                  <Text fontSize={13} className={roboto.className} textAlign="center" color="white">
                    {formatDate(tanggal)}
                  </Text>
                </Center>

                {jadwalSIM1.map?.((dt: iJadwal, index) => (
                  <Container key={index} style={{ position: "absolute", top: top1 + index * 37 }}>
                    <Center style={{ position: "absolute", left: 10 }} bg="#022c98" w={130} h={8}>
                      <Text fontSize={11} className={roboto.className} textAlign="center" color="white">
                        {dt.nama}
                      </Text>
                    </Center>
                    <Box
                      style={{ position: "absolute", left: 145, paddingTop: 3, paddingLeft: 5 }}
                      bg="rgba(255,255,255,0.9)"
                      w={185}
                      h={8}
                    >
                      <Text fontSize={9} className={roboto.className} color="#022c98">
                        {dt.lokasi}
                      </Text>
                      <Text fontSize={9} className={roboto.className} color="#022c98">
                        {dt.waktu}
                      </Text>
                    </Box>
                  </Container>
                ))}
              </Center>
              <Button onClick={() => download("canvas1", createFileName())} colorScheme="teal" size="sm" mt={4} ml={1}>
                Download
              </Button>
            </CardBody>
          </Card>
          {jadwalSIM2.length > 0 && (
            <Card>
              <CardBody>
                <Center id="canvas2" style={{ position: "relative", width: 340 }}>
                  <Image src={"/images/sim.jpg"} w={340} fit="cover" alt="media" />
                  <Center style={{ position: "absolute" }} bg="#e21e1f" py={1} px={2} rounded={10} top={3} left={4}>
                    <Text fontSize={13} className={roboto.className} textAlign="center" color="white">
                      {formatDate(tanggal)}
                    </Text>
                  </Center>

                  {jadwalSIM2.map?.((dt: iJadwal, index) => (
                    <Container key={index} style={{ position: "absolute", top: 100 + index * 37 }}>
                      <Center style={{ position: "absolute", left: 10 }} bg="#022c98" w={130} h={8}>
                        <Text fontSize={11} className={roboto.className} textAlign="center" color="white">
                          {dt.nama}
                        </Text>
                      </Center>
                      <Box
                        style={{ position: "absolute", left: 145, paddingTop: 3, paddingLeft: 5 }}
                        bg="rgba(255,255,255,0.9)"
                        w={185}
                        h={8}
                      >
                        <Text fontSize={9} className={roboto.className} color="#022c98">
                          {dt.lokasi}
                        </Text>
                        <Text fontSize={9} className={roboto.className} color="#022c98">
                          {dt.waktu}
                        </Text>
                      </Box>
                    </Container>
                  ))}
                </Center>
                <Button
                  onClick={() => download("canvas2", createFileName())}
                  colorScheme="teal"
                  size="sm"
                  mt={4}
                  ml={1}
                >
                  Download
                </Button>
              </CardBody>
            </Card>
          )}
        </SimpleGrid>
      </Box>
    </VStack>
  );
}
