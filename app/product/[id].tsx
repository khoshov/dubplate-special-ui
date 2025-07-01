import AddToCartButton from "@/components/AddToCartButton";
import AudioPlayer from "@/components/AudioPlayer";
import { Box } from "@/components/ui/box";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { API_HOST } from "@/constants/api";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import Animated, { FadeInLeft, FadeInRight, SlideInUp } from 'react-native-reanimated';
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Spinner } from "@/components/ui/spinner";
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const API_URL = `${API_HOST}/api/v1/records/`;

export default function ProductDetail() {
    const { id } = useLocalSearchParams();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const insets = useSafeAreaInsets();

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
        <Box className="flex-1 items-center justify-center min-h-screen">
            <Spinner size="large" className="text-purple-600" />
            <Text className="mt-4 text-gray-600 text-lg">Загружаем информацию...</Text>
        </Box>
    );
    if (error) return (
        <Box className="flex-1 items-center justify-center min-h-screen p-6">
            <Text className="text-red-600 text-xl font-bold mb-2">⚠️ Ошибка</Text>
            <Text className="text-red-500 text-center">{error}</Text>
        </Box>
    );
    if (!product) return (
        <Box className="flex-1 items-center justify-center min-h-screen">
            <Text className="text-gray-600 text-xl">💿 Товар не найден</Text>
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

    return (
        <ScrollView 
            className="flex-1 bg-gradient-to-b from-gray-50 to-white custom-scrollbar"
            contentInsetAdjustmentBehavior="automatic"
        >
            <Box className="w-full max-w-7xl mx-auto p-4 md:p-8">
                {/* Мобильная версия - 1 колонка */}
                <Box className="block md:hidden">
                    <Animated.View entering={SlideInUp.springify()}>
                        {/* Обложка */}
                        <Box className="w-full relative mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-xl" style={{ paddingBottom: '100%' }}>
                            <Image
                                source={{ uri: product.cover_image }}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            <Box className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                        </Box>
                        
                        {/* Информация */}
                        <VStack space="md" className="text-center">
                            <Text size="2xl" bold className="gradient-text-purple leading-tight">
                                {artistNames} - {product.title}
                            </Text>
                            {labelName && (
                                <Text className="text-gray-600 text-lg font-medium">
                                    🏾 {labelName}
                                </Text>
                            )}
                            <Text size="xl" className="text-emerald-600 font-bold">
                                {price !== "—" ? `$${price}` : price}
                            </Text>
                            <Box className="mt-4">
                                <AddToCartButton product={product} />
                            </Box>
                        </VStack>
                    </Animated.View>
                </Box>

                {/* Десктоп версия - 2 колонки */}
                <Box className="hidden md:block">
                    <HStack space="xl" className="items-start">
                        {/* Левая колонка - Обложка */}
                        <Animated.View entering={FadeInLeft.delay(200).springify()} className="flex-1 max-w-lg">
                            <Box className="sticky top-8">
                                <Box className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl overflow-hidden shadow-2xl group" style={{ paddingBottom: '100%' }}>
                                    <Image
                                        source={{ uri: product.cover_image }}
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                    <Box className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0" />
                                    
                                    {/* Приценный бейдж */}
                                    <Box className="absolute top-6 right-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-2xl shadow-lg backdrop-blur-sm border border-white/20">
                                        <Text className="text-white text-xl font-bold">
                                            {price !== "—" ? `${price}₽` : price}
                                        </Text>
                                    </Box>
                                </Box>
                                
                                {/* Кнопка покупки */}
                                <Box className="mt-6">
                                    <AddToCartButton product={product} />
                                </Box>
                                
                                {/* Аудиоплеер */}
                                {product.preview && (
                                    <Box className="mt-6">
                                        <AudioPlayer uri={product.preview} />
                                    </Box>
                                )}
                            </Box>
                        </Animated.View>

                        {/* Правая колонка - Информация */}
                        <Animated.View entering={FadeInRight.delay(400).springify()} className="flex-1">
                            <VStack space="lg">
                                {/* Заголовок */}
                                <Box>
                                    <Text size="4xl" bold className="gradient-text-purple leading-tight mb-2">
                                        {artistNames} - {product.title}
                                    </Text>
                                    {labelName && (
                                        <Text className="text-gray-600 text-xl font-medium">
                                            🏾 {labelName}
                                        </Text>
                                    )}
                                </Box>
                                {/* Информация о релизе */}
                                <Box className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                                    <Text size="xl" bold className="mb-4 text-gray-800">📊 Информация о релизе</Text>
                                    <Box className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {releaseYear && (
                                            <Box className="bg-white/70 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/50">
                                                <Text className="text-gray-700 font-medium">
                                                    📅 Год: <Text bold>{releaseYear}</Text>
                                                </Text>
                                            </Box>
                                        )}
                                        {genres && (
                                            <Box className="bg-white/70 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/50">
                                                <Text className="text-gray-700 font-medium">
                                                    🎼 Жанры: <Text bold>{genres}</Text>
                                                </Text>
                                            </Box>
                                        )}
                                        {styles && (
                                            <Box className="bg-white/70 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/50">
                                                <Text className="text-gray-700 font-medium">
                                                    🎵 Стили: <Text bold>{styles}</Text>
                                                </Text>
                                            </Box>
                                        )}
                                        {country && (
                                            <Box className="bg-white/70 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/50">
                                                <Text className="text-gray-700 font-medium">
                                                    🌍 Страна: <Text bold>{country}</Text>
                                                </Text>
                                            </Box>
                                        )}
                                        {catalog && (
                                            <Box className="bg-white/70 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/50">
                                                <Text className="text-gray-700 font-medium">
                                                    💿 Каталог: <Text bold>{catalog}</Text>
                                                </Text>
                                            </Box>
                                        )}
                                        {barcode && (
                                            <Box className="bg-white/70 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/50">
                                                <Text className="text-gray-700 font-medium">
                                                    🔢 Штрихкод: <Text bold>{barcode}</Text>
                                                </Text>
                                            </Box>
                                        )}
                                        {condition && (
                                            <Box className="bg-white/70 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/50">
                                                <Text className="text-gray-700 font-medium">
                                                    ✨ Состояние: <Text bold>{condition}</Text>
                                                </Text>
                                            </Box>
                                        )}
                                        {typeof stock === 'number' && (
                                            <Box className="bg-white/70 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/50">
                                                <Text className="text-gray-700 font-medium">
                                                    📦 В наличии: <Text bold>{stock}</Text>
                                                </Text>
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                                {/* Примечания */}
                                {product.notes && (
                                    <Box className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
                                        <Text size="xl" bold className="mb-3 text-gray-800">📝 Примечания</Text>
                                        <Text className="whitespace-pre-line text-gray-700 leading-relaxed">{product.notes}</Text>
                                    </Box>
                                )}

                                {/* Треклист */}
                                {tracklist.length > 0 && (
                                    <Box className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                                        <Text size="xl" bold className="mb-4 text-gray-800">🎵 Треклист</Text>
                                        <Box className="bg-white/70 backdrop-blur-sm rounded-xl overflow-hidden border border-white/50">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50/70">
                                                    <tr>
                                                        <th className="text-left font-bold p-3 border-b border-gray-200">#</th>
                                                        <th className="text-left font-bold p-3 border-b border-gray-200">Название</th>
                                                        <th className="text-left font-bold p-3 border-b border-gray-200">Время</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {tracklist.map((track: any, idx: number) => (
                                                        <tr key={track.id || idx} className={idx % 2 === 0 ? "bg-white/50" : "bg-gray-50/30"}>
                                                            <td className="p-3 align-top w-16 font-medium text-gray-600">{track.position}</td>
                                                            <td className="p-3 align-top font-medium text-gray-800">{track.title}</td>
                                                            <td className="p-3 align-top w-20 text-gray-600">{track.duration}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </Box>
                                    </Box>
                                )}
                            </VStack>
                        </Animated.View>
                    </HStack>
                </Box>

                {/* Мобильная версия - дополнительная информация */}
                <Box className="block md:hidden mt-8">
                    <VStack space="lg">
                        {/* Информация о релизе */}
                        <Box className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                            <Text size="lg" bold className="mb-4 text-gray-800 text-center">📊 Информация о релизе</Text>
                            <VStack space="sm">
                                {releaseYear && (
                                    <Text className="bg-white/70 backdrop-blur-sm rounded-xl px-4 py-3 text-center border border-white/50">
                                        📅 Год: {releaseYear}
                                    </Text>
                                )}
                                {genres && (
                                    <Text className="bg-white/70 backdrop-blur-sm rounded-xl px-4 py-3 text-center border border-white/50">
                                        🎼 Жанры: {genres}
                                    </Text>
                                )}
                                {styles && (
                                    <Text className="bg-white/70 backdrop-blur-sm rounded-xl px-4 py-3 text-center border border-white/50">
                                        🎵 Стили: {styles}
                                    </Text>
                                )}
                                {country && (
                                    <Text className="bg-white/70 backdrop-blur-sm rounded-xl px-4 py-3 text-center border border-white/50">
                                        🌍 Страна: {country}
                                    </Text>
                                )}
                                {catalog && (
                                    <Text className="bg-white/70 backdrop-blur-sm rounded-xl px-4 py-3 text-center border border-white/50">
                                        💿 Каталог: {catalog}
                                    </Text>
                                )}
                                {barcode && (
                                    <Text className="bg-white/70 backdrop-blur-sm rounded-xl px-4 py-3 text-center border border-white/50">
                                        🔢 Штрихкод: {barcode}
                                    </Text>
                                )}
                                {condition && (
                                    <Text className="bg-white/70 backdrop-blur-sm rounded-xl px-4 py-3 text-center border border-white/50">
                                        ✨ Состояние: {condition}
                                    </Text>
                                )}
                                {typeof stock === 'number' && (
                                    <Text className="bg-white/70 backdrop-blur-sm rounded-xl px-4 py-3 text-center border border-white/50">
                                        📦 В наличии: {stock}
                                    </Text>
                                )}
                            </VStack>
                        </Box>

                        {/* Примечания */}
                        {product.notes && (
                            <Box className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
                                <Text size="lg" bold className="mb-3 text-gray-800 text-center">📝 Примечания</Text>
                                <Text className="whitespace-pre-line text-gray-700 leading-relaxed text-center">{product.notes}</Text>
                            </Box>
                        )}

                        {/* Треклист */}
                        {tracklist.length > 0 && (
                            <Box className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                                <Text size="lg" bold className="mb-4 text-gray-800 text-center">🎵 Треклист</Text>
                                <Box className="bg-white/70 backdrop-blur-sm rounded-xl overflow-hidden border border-white/50">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50/70">
                                            <tr>
                                                <th className="text-left font-bold p-2 border-b border-gray-200">#</th>
                                                <th className="text-left font-bold p-2 border-b border-gray-200">Название</th>
                                                <th className="text-left font-bold p-2 border-b border-gray-200">Время</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tracklist.map((track: any, idx: number) => (
                                                <tr key={track.id || idx} className={idx % 2 === 0 ? "bg-white/50" : "bg-gray-50/30"}>
                                                    <td className="p-2 align-top w-12 font-medium text-gray-600">{track.position}</td>
                                                    <td className="p-2 align-top font-medium text-gray-800">{track.title}</td>
                                                    <td className="p-2 align-top w-16 text-gray-600">{track.duration}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </Box>
                            </Box>
                        )}

                        {/* Аудиоплеер */}
                        {product.preview && (
                            <Box className="mt-4 mb-8">
                                <AudioPlayer uri={product.preview} />
                            </Box>
                        )}
                    </VStack>
                </Box>
            </Box>
        </ScrollView>
    );
}
