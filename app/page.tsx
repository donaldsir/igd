"use client";
import { useState, ChangeEvent, FormEvent } from "react";
import {
  Center,
  Stack,
  FormControl,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  AspectRatio,
} from "@chakra-ui/react";
import { Icon } from "@chakra-ui/react";
import { FaPaste } from "react-icons/fa";

export default function Page() {
  const [url, setUrl] = useState("https://www.instagram.com/p/DBAuEWcNllf/");
  const proxy = "https://cors-anywhere.herokuapp.com/";
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
    } else {
      console.log(shortcode);
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
      <Stack>
        <form onSubmit={(e: FormEvent<HTMLFormElement>) => submit(e)}>
          <FormControl>
            <InputGroup>
              <Input
                type="text"
                minW={550}
                value={url}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
                placeholder="Paste URL Instagram"
              />
              <InputRightElement>
                <Button>
                  <Icon as={FaPaste} color="#493628" />
                </Button>
              </InputRightElement>
            </InputGroup>
            <Button type="submit" colorScheme="red" size="sm" mt={2}>
              Download
            </Button>
          </FormControl>
        </form>

        {/* <AspectRatio ratio={4 / 3} mt={10}>
          <iframe src={url} />
        </AspectRatio> */}
      </Stack>
    </Center>
  );
}
