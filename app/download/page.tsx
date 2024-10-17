"use client";
import { useState, ChangeEvent, FormEvent } from "react";
import {
    Center,
    HStack,
    FormControl,
    Input,
    InputGroup,
    InputRightElement,
    Button,
    SimpleGrid,
    Box,
    AspectRatio,
    Card,
    CardHeader,
    CardBody,
    Heading,
} from "@chakra-ui/react";
import { Icon } from "@chakra-ui/react";
import { FaPaste } from "react-icons/fa";


export default function Page() {
    const [url, setUrl] = useState("https://www.instagram.com/p/DBAuEWcNllf/embed/captioned");
    const [caption, setCaption] = useState('');

    const getInstagramShortcode = (urlShort: string) => {
        const regex = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/p\/([A-Za-z0-9_-]+)/;
        const match = urlShort.match(regex);
        return match ? match[1] : null;
    };

    const submit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const shortcode = getInstagramShortcode(url);
        const apiUrl = `https://instagram-scraper-api2.p.rapidapi.com/v1/post_info?code_or_id_or_url=${shortcode}-&include_insights=true`;

        try {
            // const response = await fetch(apiUrl, {
            //     method: 'GET',
            //     headers: {
            //         'x-rapidapi-key': `3ab2799145msh117680a9dd1be7fp17da44jsn64b3358ca745`, // Include your token here
            //     },
            // });
            // const res = await response.json();
            // const data = res.data;


            const res = await fetch(`/api/single`, { method: "GET" });
            const data = await res.json();
            setCaption(data.result.caption.text)
            console.log(data.result.caption)

        } catch (error) {
            console.error(error);
        }



    };
    return (
        <SimpleGrid minChildWidth='180px' m={4} spacing={8}>
            <Card>
                <CardHeader>
                    <Heading size='md'>URL</Heading>
                </CardHeader>
                <CardBody>
                    <form onSubmit={(e: FormEvent<HTMLFormElement>) => submit(e)}>
                        <FormControl>
                            <InputGroup>
                                <Input
                                    type="text"
                                    size="sm"
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
                            <Button type="submit" colorScheme="teal" size="sm" mt={2}>
                                Submit
                            </Button>
                        </FormControl>
                    </form>

                </CardBody>
            </Card>
            <Card>
                <CardHeader>
                    <Heading size='md'>Result</Heading>
                </CardHeader>
                <CardBody>
                    <Heading size='sm'>Caption</Heading>
                    {caption}
                </CardBody>
            </Card>

        </SimpleGrid >

    );
}
