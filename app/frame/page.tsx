"use client";
import { useState, FormEvent } from "react";
import {
    FormControl,
    Input,
    Button,
    SimpleGrid,
    Box,
    Card,
    CardHeader,
    CardBody,
    Heading,
    Spacer,
    VStack,
    Image,
    StackDivider,
    IconButton,
    HStack,
    Textarea,
    FormLabel,
    Text,
} from "@chakra-ui/react";
import { Icon, useToast } from "@chakra-ui/react";
import { FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function Page() {
    const router = useRouter();
    const toast = useToast();

    const [gambar, setGambar] = useState('')
    const [width, setWidth] = useState(0)
    const [height, setHeight] = useState(0)
    const [title, setTitle] = useState('5 game karya civitas instiki tampil dalam indonesia game developer exchange (igdx) 2024!')
    const [lines, setLines] = useState<string[]>([])

    const onChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { files } = e.target;
        const selectedFiles = files as FileList;

        const blob = new Blob([selectedFiles?.[0]])
        const imgsrc = URL.createObjectURL(blob)

        const img = new (window as any).Image()
        img.onload = function () {
            setWidth(this.width)
            setHeight(this.height)
            URL.revokeObjectURL(imgsrc);
        };
        img.src = imgsrc;
        setGambar(imgsrc)

    }

    const submit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const arrTitle = title.split(" ")
        let numRow = 0;
        let start = arrTitle.length - 1
        const titles = new Array();

        while (numRow < 3) {
            let currLength = 0;
            let singleLine = new Array();
            let space = 1;
            for (let i = start; i >= 0; i--) {
                let newLength = currLength + arrTitle[i].length + space

                if (i === 0) {
                    singleLine.push(arrTitle[i].toUpperCase())
                    singleLine.reverse()
                    titles.push(singleLine.join(" "))
                    numRow = 3;
                } else {
                    if (newLength <= 40) {
                        singleLine.push(arrTitle[i].toUpperCase())
                        space++;
                        currLength = newLength;
                    } else {
                        singleLine.reverse()
                        titles.push(singleLine.join(" "))
                        start = i;
                        break;
                    }
                }
            }
            numRow++;
        }


        setLines(titles)
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
                        onClick={() => router.push('/')}
                    />
                    <Spacer />
                    <Image src="/images/logo-text.png" w={100} alt="logo" />
                </HStack>
            </Box>
            <Box>
                <SimpleGrid columns={{ md: 2, sm: 1 }} m={4} spacing={8}>
                    <Card>
                        <CardHeader>
                            <Heading size="sm">Upload Image</Heading>
                        </CardHeader>
                        <CardBody>
                            <form onSubmit={(e: FormEvent<HTMLFormElement>) => submit(e)}>
                                <FormControl >
                                    <FormLabel>File Receipt</FormLabel>
                                    <Input type="file" size='sm' onChange={(e) => onChangeFile(e)} />
                                </FormControl>
                                <FormControl mt={4}>
                                    <FormLabel>Title <span style={{ color: "red", fontSize: 14 }}>({`${title.length}/90`})</span></FormLabel>
                                    <Textarea
                                        value={title}
                                        style={{ whiteSpace: "pre-wrap" }}
                                        size='sm'
                                        rows={3}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </FormControl>
                                <Button type="submit" colorScheme="teal" size="sm" mt={4} >
                                    Create Frame
                                </Button>
                            </form>
                        </CardBody>
                    </Card>
                    <div id="container" style={{ position: "relative" }}>
                        <Image src="/images/logo-pd.png" w={120} style={{ position: "absolute", top: 10, left: 255 }} />
                        <Image src={gambar ? gambar : "/images/no-image.jpg"} w={400} h={500} fit="cover" />
                        {lines.map((item, index) => (
                            <Text
                                key={index}
                                style={{ position: "absolute", top: 450 - (37 * index), }}
                                bg="teal"
                                color="white"
                                fontWeight="medium"
                                ml={1}
                                fontSize={21.7}
                                px={1}

                            >
                                {item}
                            </Text>
                        ))}

                    </div>
                </SimpleGrid>
            </Box>
        </VStack>
    )
}