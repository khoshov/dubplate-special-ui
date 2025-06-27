import { Box } from "@/components/ui/box";
import { Image } from "@/components/ui/image";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { useRouter } from "expo-router";
import AddToCartButton from "./AddToCartButton";

// Define the Product type based on API structure
interface Product {
    id: number;
    title: string;
    artists?: { id: number; name: string; discogs_id: number; bio?: string | null }[];
    label?: { id: number; name: string; discogs_id: number; description?: string };
    cover_image?: string;
    price?: number;
}

export default function ProductCard({product}: {product: Product}) {
    const router = useRouter();
    const artistNames = product.artists ? product.artists.map((a: {name: string}) => a.name).join(", ") : "";
    const labelName = product.label ? product.label.name : "";
    const price = product.price !== undefined ? product.price : "—";
    return (
        <Box className="p-3 border border-gray-200 rounded-md mb-4 flex flex-col items-center h-96 min-h-96">
            <Pressable className="w-full" onPress={() => router.push(`/product/${product.id}`)}>
                <Box className="w-full aspect-square overflow-hidden rounded-sm">
                    <Image source={{uri: product.cover_image}} className="w-full h-full object-cover"/>
                </Box>
                <Text className="mt-2 text-sm font-bold text-center">{artistNames} - {product.title}</Text>
                <Text className="text-xs text-gray-500 text-center">{labelName}</Text>
            </Pressable>
            <Box className="flex-grow" />
            <Text className="mt-1 text-primary-500 text-center">{price !== "—" ? `$${price}` : price}</Text>
            <Box className="mt-2 w-full flex items-center justify-center">
                <AddToCartButton product={product} />
            </Box>
        </Box>
    );
}
