import ProductList from "@/components/ProductList";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { API_HOST } from "@/constants/api";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import Animated, { FadeInDown, SlideInUp } from 'react-native-reanimated';
import { Spinner } from '@/components/ui/spinner';
import { ScrollView } from 'react-native';

interface Product {
  id: number;
  title: string;
  artists?: { id: number; name: string; discogs_id: number; bio?: string | null }[];
  label?: { id: number; name: string; discogs_id: number; description?: string };
  cover_image?: string;
  price?: number;
  genres?: { name: string }[];
  styles?: { name: string }[];
}

// const PAGE_SIZE = 6;
const API_URL = `${API_HOST}/api/v1/records/`;

export default function CategoryPage() {
    const {slug, name} = useLocalSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const isFetching = useRef(false);

    useEffect(() => {
        setLoading(true);
        setError(null);
        const styleName = name ? String(name) : String(slug).replace(/-/g, ' ');
        fetch(`${API_URL}?style=${encodeURIComponent(styleName)}&page=1`)
            .then(res => {
                if (!res.ok) throw new Error("Ошибка загрузки товаров");
                return res.json();
            })
            .then(data => {
                setProducts(data.results || []);
                setHasMore(!!data.next);
                setLoading(false);
                setPage(2);
            })
            .catch(err => {
                setError(err.message || "Ошибка");
                setLoading(false);
            });
    }, [slug, name]);

    const loadMore = () => {
        if (!hasMore || isFetching.current) return;
        isFetching.current = true;
        const styleName = name ? String(name) : String(slug).replace(/-/g, ' ');
        fetch(`${API_URL}?style=${encodeURIComponent(styleName)}&page=${page}`)
            .then(res => {
                if (!res.ok) throw new Error("Ошибка загрузки товаров");
                return res.json();
            })
            .then(data => {
                setProducts(prev => [...prev, ...(data.results || [])]);
                setHasMore(!!data.next);
                setPage(p => p + 1);
            })
            .catch(err => {
                setError(err.message || "Ошибка");
            })
            .finally(() => {
                isFetching.current = false;
            });
    };

    const handleScroll = (e: any) => {
        const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
        const paddingToBottom = 100;
        if (
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom
        ) {
            loadMore();
        }
    };

    const categoryName = String(name || slug).replace(/-/g, ' ');
    const categoryEmoji = {
        'jungle': '🌴',
        'dub': '🎵',
        'house': '🏠',
        'liquid': '💧',
        'dnb': '⚡',
        'drum and bass': '⚡',
        'techno': '🤖',
        'ambient': '☁️',
        'hardcore': '🔥'
    }[categoryName.toLowerCase()] || '🎶';

    return (
        <ScrollView 
            className="flex-1 bg-gradient-to-b from-gray-50 to-white custom-scrollbar" 
            onScroll={handleScroll} 
            scrollEventThrottle={16}
            contentInsetAdjustmentBehavior="automatic"
        >
            <Box className="px-4 py-6">
                {/* Геро секция жанра */}
                <Animated.View entering={SlideInUp.delay(200).springify()}>
                    <Box className="text-center mb-8 py-8 px-6 bg-gradient-to-r from-purple-100 via-pink-50 to-blue-100 rounded-2xl shadow-lg border border-white/50">
                        <Text className="text-6xl mb-3">{categoryEmoji}</Text>
                        <Text size="3xl" bold className="gradient-text-purple mb-2 capitalize">
                            {categoryName}
                        </Text>
                        <Text size="lg" className="text-gray-600">
                            Лучшие релизы в жанре
                        </Text>
                        <Box className="flex flex-row justify-center items-center gap-2 mt-4">
                            <Text className="text-2xl">🎧</Text>
                            <Text className="text-2xl">💿</Text>
                            <Text className="text-2xl">🎼</Text>
                        </Box>
                    </Box>
                </Animated.View>

                {/* Контент */}
                <Animated.View entering={FadeInDown.delay(400).springify()}>
                    <Box className="mb-6">
                        {loading && (
                            <Box className="flex items-center justify-center py-12">
                                <Spinner size="large" className="text-purple-600" />
                                <Text className="mt-4 text-gray-600 text-lg">Загружаем треки...</Text>
                            </Box>
                        )}
                        
                        {error && (
                            <Box className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                                <Text className="text-red-600 text-lg font-semibold">⚠️ Ошибка</Text>
                                <Text className="text-red-500 mt-2">{error}</Text>
                            </Box>
                        )}
                        
                        {!loading && !error && products.length === 0 && (
                            <Box className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                                <Text className="text-4xl mb-2">😔</Text>
                                <Text className="text-yellow-700 text-lg font-semibold">Ничего не найдено</Text>
                                <Text className="text-yellow-600 mt-2">В этом жанре пока нет товаров</Text>
                            </Box>
                        )}
                        
                        {!loading && !error && products.length > 0 && <ProductList products={products}/>}
                    </Box>
                </Animated.View>
                
                {/* Индикатор загрузки */}
                {hasMore && !loading && products.length > 0 && (
                    <Animated.View entering={FadeInDown.springify()}>
                        <Box className="text-center py-8 px-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 mt-6">
                            <Text className="text-gray-600 text-base animate-pulse-slow">
                                🔄 Прокрутите вниз для загрузки ещё...
                            </Text>
                        </Box>
                    </Animated.View>
                )}
            </Box>
        </ScrollView>
    );
}
