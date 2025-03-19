"use client";
import { Center, VStack, Button, Image, Box, SimpleGrid, Heading, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  return (
    <Center height="50vh">
      <VStack>
        <Image src="/images/logo-pd.png" alt="logo" h={128} />

        <Box mt={10} borderWidth={2} borderRadius={10} p={4}>
          <SimpleGrid w={400}>
            <Heading fontSize="xl" textAlign="center">
              All-in-One Media App
            </Heading>
            <Text mt={2} textAlign="justify">
              This application offers multiple features to enhance your digital experience and simplify daily tasks.
              Whether you need to check the Mobile Driving License Service (SIM Keliling) schedule, add text to Reels
              and videos, or download media from a feed, this app has you covered!
            </Text>
          </SimpleGrid>
          <SimpleGrid columns={2} spacing={2} mt={4}>
            <Button
              colorScheme="teal"
              onClick={() => {
                router.push(`/download`);
              }}
            >
              Instagram Downloader
            </Button>
            <Button
              colorScheme="teal"
              onClick={() => {
                router.push(`/sim`);
              }}
            >
              Driving License Renewal
            </Button>
          </SimpleGrid>
          <SimpleGrid columns={2} spacing={2} mt={2}>
            <Button
              colorScheme="teal"
              onClick={() => {
                router.push(`/video`);
              }}
            >
              Text on Reels
            </Button>
            <Button
              colorScheme="teal"
              onClick={() => {
                router.push(`/watermark`);
              }}
            >
              Text on Video
            </Button>
          </SimpleGrid>

          <SimpleGrid w={400} mt={6}>
            <Text textAlign="center" fontSize="sm" color="gray">
              Donald Siregar
            </Text>
          </SimpleGrid>
        </Box>
      </VStack>
    </Center>
  );
}
