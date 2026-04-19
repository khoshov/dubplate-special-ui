import ProductList from "@/components/ProductList";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { API_HOST } from "@/constants/api";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
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

const API_URL = `${API_HOST}/api/v1/records/records/`;

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

    return (
        <ScrollView 
            className="flex-1 bg-white custom-scrollbar" 
            onScroll={handleScroll} 
            scrollEventThrottle={16}
            contentInsetAdjustmentBehavior="automatic"
        >
            <Box className="px-4 py-6">
                <Box className="mb-8">
                    <Text size="2xl" bold className="text-zinc-900 text-center capitalize">
                        {categoryName}
                    </Text>
                    <Text size="sm" className="text-zinc-500 text-center mt-1">
                        Релизы в стиле
                    </Text>
                </Box>

                <Box className="mb-6">
                    {loading && (
                        <Box className="flex items-center justify-center py-16">
                            <Spinner size="large" className="text-zinc-400" />
                            <Text className="mt-4 text-zinc-400 text-sm">Загрузка...</Text>
                        </Box>
                    )}
                    
                    {error && (
                        <Box className="bg-zinc-50 border border-zinc-200 rounded-lg p-6 text-center">
                            <Text className="text-zinc-900 text-sm font-semibold">Ошибка</Text>
                            <Text className="text-zinc-500 mt-1 text-sm">{error}</Text>
                        </Box>
                    )}
                    
                    {!loading && !error && products.length === 0 && (
                        <Box className="py-16 items-center">
                            <Text className="text-zinc-400 text-sm">В этом стиле пока нет релизов</Text>
                        </Box>
                    )}
                    
                    {!loading && !error && products.length > 0 && <ProductList products={products}/>}
                </Box>
                
                {hasMore && !loading && products.length > 0 && (
                    <Box className="text-center py-6">
                        <Text className="text-zinc-400 text-sm">
                            Прокрутите вниз для загрузки ещё
                        </Text>
                    </Box>
                )}
            </Box>
        </ScrollView>
    );
}
