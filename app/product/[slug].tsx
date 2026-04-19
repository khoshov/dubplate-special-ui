import AddToCartButton from "@/components/AddToCartButton";
import AudioPlayer from "@/components/AudioPlayer";
import { Box } from "@/components/ui/box";
import { Image } from "@/components/ui/image";
import { ScrollView } from "@/components/ui/scroll-view";
import { Text } from "@/components/ui/text";
import { API_HOST } from "@/constants/api";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

const API_URL = `${API_HOST}/api/v1/records/records/`;

export default function ProductDetail() {
    const { id } = useLocalSearchParams();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        setError(null);
        fetch(`${API_URL}${id}/`)
            .then(res => {
                if (!res.ok) throw new Error("Ошибка загрузки товара");
                return res.json();
            })
            .then(data => {
                setProduct(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message || "Ошибка");
                setLoading(false);
            });
    }, [id]);

    if (loading) return <Text className="p-4 text-zinc-400 text-sm">Загрузка...</Text>;
    if (error) return <Text className="p-4 text-red-500 text-sm">{error}</Text>;
    if (!product) return <Text className="p-4 text-zinc-400 text-sm">Не найдено</Text>;

    const artistNames = product.artists ? product.artists.map((a: any) => a.name).join(", ") : "";
    const labelName = product.label ? product.label.name : "";
    const price = product.price !== undefined ? product.price : "—";

    return (
        <ScrollView className="p-4 min-h-screen bg-white">
            <Box className="max-w-xl mx-auto">
                <Box className="w-full aspect-square overflow-hidden rounded-lg mb-4 bg-zinc-100">
                    <Image source={{ uri: product.cover_image }} className="w-full h-full object-cover" />
                </Box>
                <Text size="xl" bold className="mt-4 text-center text-zinc-900">{artistNames} — {product.title}</Text>
                <Text className="text-zinc-500 text-center text-sm">{labelName}</Text>
                <Text size="lg" className="text-zinc-900 font-semibold mt-2 text-center">{price !== "—" ? `${price}₽` : price}</Text>
                {product.notes && (
                    <Text className="mt-4 whitespace-pre-line text-center text-xs text-zinc-500">{product.notes}</Text>
                )}
                {product.preview && (
                    <Box className="mt-4">
                        <AudioPlayer uri={product.preview} />
                    </Box>
                )}
                <Box className="mt-6 flex items-center justify-center">
                    <AddToCartButton product={product} />
                </Box>
            </Box>
        </ScrollView>
    );
}
