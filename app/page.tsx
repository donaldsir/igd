"use client";
import { useState, FormEvent } from "react";
import {
  Center,
  HStack,
  Button
} from "@chakra-ui/react";
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()
  const [url, setUrl] = useState("https://www.instagram.com/p/DBAuEWcNllf/");
  const accessToken =
    "IGQWROTU1ZAYnB6MmkwZAC0wcUVVN2w5QVNybmJSaVNDNURjQ0FoVzA1QmNSQjl4ejdyekpnREVsN21nYXJUanV5VWJJSUVFQktFRV9KLUdmc21TUzlfdWxvS0FxMGtqNGFoVzhHUmI1d2lGNF9oeE9kS2VCeUJzb00ZD";

  const getInstagramShortcode = (urlShort: string) => {
    const regex = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/p\/([A-Za-z0-9_-]+)/;
    const match = urlShort.match(regex);
    return match ? match[1] : null;
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const shortcode = getInstagramShortcode(url);
    const apiUrl = `https://graph.instagram.com/${shortcode}?fields=caption&access_token=${accessToken}`;

    if (!shortcode) {
      console.error("Invalid Instagram URL");
      return;
    }

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <Center height="100vh">
      <HStack>
        <Button colorScheme="teal" onClick={() => { router.push(`/download`) }}>
          DOWNLOADER
        </Button>
        <Button colorScheme="teal" onClick={() => { router.push(`/download`) }}>
          FRAME MAKER
        </Button>
      </HStack>
    </Center>
  );
}
