import AddToCartButton from "@/components/AddToCartButton";
import AudioPlayer from "@/components/AudioPlayer";
import { Box } from "@/components/ui/box";
import { Image } from "@/components/ui/image";
import { ScrollView } from "@/components/ui/scroll-view";
import { Text } from "@/components/ui/text";
import { API_HOST } from "@/constants/api";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

const API_URL = `${API_HOST}/api/v1/records/`;

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

    if (loading) return <Text className="p-4">Загрузка...</Text>;
    if (error) return <Text className="p-4 text-red-500">{error}</Text>;
    if (!product) return <Text className="p-4">Не найдено</Text>;

    const artistNames = product.artists ? product.artists.map((a: any) => a.name).join(", ") : "";
    const labelName = product.label ? product.label.name : "";
    const price = product.price !== undefined ? product.price : "—";

    return (
        <ScrollView className="p-4 min-h-screen">
            <Box className="max-w-xl mx-auto">
                <Box className="w-full aspect-square overflow-hidden rounded-md mb-4">
                    <Image source={{ uri: product.cover_image }} className="w-full h-full object-cover" />
                </Box>
                <Text size="xl" bold className="mt-4 text-center">{artistNames} - {product.title}</Text>
                <Text className="text-gray-500 text-center">{labelName}</Text>
                <Text size="lg" className="text-primary-500 mt-2 text-center">{price !== "—" ? `$${price}` : price}</Text>
                {product.notes && (
                    <Text className="mt-4 whitespace-pre-line text-center text-xs text-gray-600">{product.notes}</Text>
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
