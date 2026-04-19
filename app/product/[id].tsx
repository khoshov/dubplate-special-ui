import AddToCartButton from "@/components/AddToCartButton";
import AudioPlayer from "@/components/AudioPlayer";
import { Box } from "@/components/ui/box";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { API_HOST } from "@/constants/api";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Spinner } from "@/components/ui/spinner";
import { ScrollView } from 'react-native';

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

    if (loading) return (
        <Box className="flex-1 items-center justify-center min-h-screen bg-white">
            <Spinner size="large" className="text-zinc-400" />
            <Text className="mt-4 text-zinc-400 text-sm">Загрузка...</Text>
        </Box>
    );
    if (error) return (
        <Box className="flex-1 items-center justify-center min-h-screen bg-white p-6">
            <Text className="text-zinc-900 text-base font-semibold mb-2">Ошибка</Text>
            <Text className="text-zinc-500 text-center text-sm">{error}</Text>
        </Box>
    );
    if (!product) return (
        <Box className="flex-1 items-center justify-center min-h-screen bg-white">
            <Text className="text-zinc-400 text-sm">Товар не найден</Text>
        </Box>
    );

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

    const infoItems = [
        { label: "Год", value: releaseYear },
        { label: "Жанры", value: genres },
        { label: "Стили", value: styles },
        { label: "Страна", value: country },
        { label: "Каталог", value: catalog },
        { label: "Штрихкод", value: barcode },
        { label: "Состояние", value: condition },
        ...(typeof stock === 'number' ? [{ label: "В наличии", value: String(stock) }] : []),
    ].filter(item => item.value);

    return (
        <ScrollView 
            className="flex-1 bg-white"
            contentInsetAdjustmentBehavior="automatic"
        >
            <Box className="w-full max-w-5xl mx-auto p-4 md:p-8">
                {/* Мобильная версия */}
                <Box className="block md:hidden">
                    <Box className="w-full relative mb-6 bg-zinc-100 rounded-lg overflow-hidden" style={{ paddingBottom: '100%' }}>
                        <Image
                            source={{ uri: product.cover_image }}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    </Box>
                    
                    <VStack space="sm" className="text-center">
                        <Text size="xl" bold className="text-zinc-900 leading-tight">
                            {artistNames} — {product.title}
                        </Text>
                        {labelName && (
                            <Text className="text-zinc-500 text-sm">{labelName}</Text>
                        )}
                        <Text size="lg" className="text-zinc-900 font-semibold mt-1">
                            {price !== "—" ? `${price}₽` : price}
                        </Text>
                        <Box className="mt-4">
                            <AddToCartButton product={product} />
                        </Box>
                    </VStack>
                </Box>

                {/* Десктоп версия */}
                <Box className="hidden md:block">
                    <HStack space="xl" className="items-start">
                        {/* Левая колонка - Обложка */}
                        <Box className="flex-1 max-w-lg">
                            <Box className="sticky top-8">
                                <Box className="relative bg-zinc-100 rounded-lg overflow-hidden" style={{ paddingBottom: '100%' }}>
                                    <Image
                                        source={{ uri: product.cover_image }}
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                </Box>
                                
                                <Box className="mt-6">
                                    <AddToCartButton product={product} />
                                </Box>
                                
                                {product.preview && (
                                    <Box className="mt-4">
                                        <AudioPlayer uri={product.preview} />
                                    </Box>
                                )}
                            </Box>
                        </Box>

                        {/* Правая колонка - Информация */}
                        <Box className="flex-1">
                            <VStack space="lg">
                                <Box>
                                    <Text size="2xl" bold className="text-zinc-900 leading-tight mb-1">
                                        {artistNames} — {product.title}
                                    </Text>
                                    {labelName && (
                                        <Text className="text-zinc-500">{labelName}</Text>
                                    )}
                                    <Text size="xl" className="text-zinc-900 font-semibold mt-2">
                                        {price !== "—" ? `${price}₽` : price}
                                    </Text>
                                </Box>

                                {/* Информация о релизе */}
                                {infoItems.length > 0 && (
                                    <Box className="border border-zinc-200 rounded-lg p-5">
                                        <Text size="sm" bold className="mb-3 text-zinc-900 uppercase tracking-wider">Информация</Text>
                                        <Box className="space-y-2">
                                            {infoItems.map((item, idx) => (
                                                <HStack key={idx} className="justify-between py-1.5 border-b border-zinc-100 last:border-b-0">
                                                    <Text className="text-zinc-500 text-sm">{item.label}</Text>
                                                    <Text className="text-zinc-900 text-sm font-medium">{item.value}</Text>
                                                </HStack>
                                            ))}
                                        </Box>
                                    </Box>
                                )}

                                {/* Примечания */}
                                {product.notes && (
                                    <Box className="border border-zinc-200 rounded-lg p-5">
                                        <Text size="sm" bold className="mb-3 text-zinc-900 uppercase tracking-wider">Примечания</Text>
                                        <Text className="whitespace-pre-line text-zinc-600 text-sm leading-relaxed">{product.notes}</Text>
                                    </Box>
                                )}

                                {/* Треклист */}
                                {tracklist.length > 0 && (
                                    <Box className="border border-zinc-200 rounded-lg p-5">
                                        <Text size="sm" bold className="mb-3 text-zinc-900 uppercase tracking-wider">Треклист</Text>
                                        <Box className="space-y-0">
                                            {tracklist.map((track: any, idx: number) => (
                                                <HStack key={track.id || idx} className={`py-2 border-b border-zinc-100 last:border-b-0 ${idx % 2 !== 0 ? 'bg-zinc-50 -mx-5 px-5' : ''}`}>
                                                    <Text className="text-zinc-400 text-sm w-12">{track.position}</Text>
                                                    <Text className="text-zinc-900 text-sm flex-1">{track.title}</Text>
                                                    <Text className="text-zinc-400 text-sm w-16 text-right">{track.duration}</Text>
                                                </HStack>
                                            ))}
                                        </Box>
                                    </Box>
                                )}
                            </VStack>
                        </Box>
                    </HStack>
                </Box>

                {/* Мобильная версия - дополнительная информация */}
                <Box className="block md:hidden mt-6">
                    <VStack space="md">
                        {infoItems.length > 0 && (
                            <Box className="border border-zinc-200 rounded-lg p-4">
                                <Text size="sm" bold className="mb-3 text-zinc-900 uppercase tracking-wider text-center">Информация</Text>
                                <Box className="space-y-2">
                                    {infoItems.map((item, idx) => (
                                        <HStack key={idx} className="justify-between py-1.5 border-b border-zinc-100 last:border-b-0">
                                            <Text className="text-zinc-500 text-sm">{item.label}</Text>
                                            <Text className="text-zinc-900 text-sm font-medium">{item.value}</Text>
                                        </HStack>
                                    ))}
                                </Box>
                            </Box>
                        )}

                        {product.notes && (
                            <Box className="border border-zinc-200 rounded-lg p-4">
                                <Text size="sm" bold className="mb-3 text-zinc-900 uppercase tracking-wider text-center">Примечания</Text>
                                <Text className="whitespace-pre-line text-zinc-600 text-sm leading-relaxed text-center">{product.notes}</Text>
                            </Box>
                        )}

                        {tracklist.length > 0 && (
                            <Box className="border border-zinc-200 rounded-lg p-4">
                                <Text size="sm" bold className="mb-3 text-zinc-900 uppercase tracking-wider text-center">Треклист</Text>
                                <Box className="space-y-0">
                                    {tracklist.map((track: any, idx: number) => (
                                        <HStack key={track.id || idx} className={`py-2 border-b border-zinc-100 last:border-b-0 ${idx % 2 !== 0 ? 'bg-zinc-50 -mx-4 px-4' : ''}`}>
                                            <Text className="text-zinc-400 text-sm w-10">{track.position}</Text>
                                            <Text className="text-zinc-900 text-sm flex-1">{track.title}</Text>
                                            <Text className="text-zinc-400 text-sm w-14 text-right">{track.duration}</Text>
                                        </HStack>
                                    ))}
                                </Box>
                            </Box>
                        )}

                        {product.preview && (
                            <Box className="mt-2 mb-4">
                                <AudioPlayer uri={product.preview} />
                            </Box>
                        )}
                    </VStack>
                </Box>
            </Box>
        </ScrollView>
    );
}
