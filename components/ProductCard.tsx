import { Box } from "@/components/ui/box";
import { Image } from "@/components/ui/image";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { useRouter } from "expo-router";
import AddToCartButton from "./AddToCartButton";

interface Product {
    id: number;
    title: string;
    artists?: { id: number; name: string; discogs_id: number; bio?: string | null }[];
    label?: { id: number; name: string; discogs_id: number; description?: string };
    cover_image?: string;
    price?: number;
}

export default function ProductCard({product}: {product: Product, index?: number}) {
    const router = useRouter();
    const artistNames = product.artists ? product.artists.map((a: {name: string}) => a.name).join(", ") : "";
    const labelName = product.label ? product.label.name : "";
    const price = product.price !== undefined ? product.price : "—";

    return (
        <Box className="bg-white rounded-lg border border-zinc-200 overflow-hidden mb-4">
            <Pressable 
                className="w-full" 
                onPress={() => router.push(`/product/${product.id}`)}
            >
                <Box className="relative w-full aspect-square overflow-hidden bg-zinc-100">
                    <Image 
                        source={{uri: product.cover_image}} 
                        className="w-full h-full object-cover"
                    />
                    {price !== "—" && (
                        <Box className="absolute top-2 right-2 bg-zinc-900 px-2.5 py-1 rounded-md">
                            <Text className="text-white text-xs font-semibold">{price}₽</Text>
                        </Box>
                    )}
                </Box>
                
                <Box className="p-4 space-y-1">
                    <Text className="text-sm font-semibold text-zinc-900 leading-tight" numberOfLines={2}>
                        {artistNames} — {product.title}
                    </Text>
                    {labelName && (
                        <Text className="text-xs text-zinc-500" numberOfLines={1}>
                            {labelName}
                        </Text>
                    )}
                </Box>
            </Pressable>
            
            <Box className="px-4 pb-4">
                <AddToCartButton product={product} />
            </Box>
        </Box>
    );
}
