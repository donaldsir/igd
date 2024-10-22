"use client";
import { Center, HStack, VStack, Button, Image } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  return (
    <Center height="50vh">
      <VStack>
        <Image src="/images/logo-pd.png" alt="logo" h={128} />
        <HStack mt={10} borderWidth={2} borderRadius={10} p={4}>
          <Button
            colorScheme="teal"
            onClick={() => {
              router.push(`/download`);
            }}
          >
            DOWNLOADER
          </Button>
          <Button
            colorScheme="teal"
            onClick={() => {
              router.push(`/frame`);
            }}
          >
            FRAME MAKER
          </Button>
        </HStack>
      </VStack>
    </Center>
  );
}
