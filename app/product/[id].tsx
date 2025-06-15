import AddToCartButton from "@/components/AddToCartButton";
import AudioPlayer from "@/components/AudioPlayer";
import { Box } from "@/components/ui/box";
import { Image } from "@/components/ui/image";
import { ScrollView } from "@/components/ui/scroll-view";
import { Text } from "@/components/ui/text";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

const API_URL = "http://167.172.35.211/api/v1/records/";

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
    const genres = product.genres ? product.genres.map((g: any) => g.name).join(", ") : "";
    const styles = product.styles ? product.styles.map((s: any) => s.name).join(", ") : "";
    const country = product.country || "";
    const catalog = product.catalog_number || "";
    const barcode = product.barcode || "";
    const condition = product.condition || "";
    const stock = product.stock !== undefined ? product.stock : "";
    const releaseYear = product.release_year || "";
    const tracklist = product.tracks || [];

    return (
        <ScrollView className="p-4 min-h-screen">
            <Box className="max-w-2xl mx-auto">
                <Box className="w-full max-w-2xl mx-auto relative mb-6 bg-gray-100 rounded-md overflow-hidden" style={{ paddingBottom: '100%' }}>
                    <Image
                        source={{ uri: product.cover_image }}
                        className="absolute inset-0 w-full h-full object-cover rounded-md"
                    />
                </Box>
                <Text size="xl" bold className="mt-4 text-center">{artistNames} - {product.title}</Text>
                <Text className="text-gray-500 text-center">{labelName}</Text>
                <Text size="lg" className="text-primary-500 mt-2 text-center">{price !== "—" ? `$${price}` : price}</Text>
                <Box className="mt-4 mb-2">
                    {releaseYear && (
                        <Text className="bg-gray-100 rounded px-3 py-1 mb-2 mx-1 text-center">
                            📅 Год: {releaseYear}
                        </Text>
                    )}
                    {genres && (
                        <Text className="bg-gray-100 rounded px-3 py-1 mb-2 mx-1 text-center">
                            🎼 Жанры: {genres}
                        </Text>
                    )}
                    {styles && (
                        <Text className="bg-gray-100 rounded px-3 py-1 mb-2 mx-1 text-center">
                            🎵 Стили: {styles}
                        </Text>
                    )}
                    {country && (
                        <Text className="bg-gray-100 rounded px-3 py-1 mb-2 mx-1 text-center">
                            🌍 Страна: {country}
                        </Text>
                    )}
                    {catalog && (
                        <Text className="bg-gray-100 rounded px-3 py-1 mb-2 mx-1 text-center">
                            💿 Каталог: {catalog}
                        </Text>
                    )}
                    {barcode && (
                        <Text className="bg-gray-100 rounded px-3 py-1 mb-2 mx-1 text-center">
                            🔢 Штрихкод: {barcode}
                        </Text>
                    )}
                    {condition && (
                        <Text className="bg-gray-100 rounded px-3 py-1 mb-2 mx-1 text-center">
                            ✨ Состояние: {condition}
                        </Text>
                    )}
                    {typeof stock === 'number' && (
                        <Text className="bg-gray-100 rounded px-3 py-1 mb-2 mx-1 text-center">
                            📦 В наличии: {stock}
                        </Text>
                    )}
                </Box>
                <Box className="mt-4">
                {product.notes && (
                    <Text className="mt-4 whitespace-pre-line text-center text-xs text-gray-600">{product.notes}</Text>
                )}
                </Box>
                {tracklist.length > 0 && (
                    <Box className="mt-6">
                        <Text bold className="mb-2 text-center">Треклист</Text>
                        <table className="w-full text-xs border-collapse">
                            <thead>
                                <tr>
                                    <th className="text-left font-bold p-1">#</th>
                                    <th className="text-left font-bold p-1">Название</th>
                                    <th className="text-left font-bold p-1">Время</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tracklist.map((track: any, idx: number) => (
                                    <tr key={track.id || idx} className="border-t">
                                        <td className="p-1 align-top w-10">{track.position}</td>
                                        <td className="p-1 align-top">{track.title}</td>
                                        <td className="p-1 align-top w-14">{track.duration}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Box>
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
