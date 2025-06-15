import ProductList from "@/components/ProductList";
import { Box } from "@/components/ui/box";
import { ScrollView } from "@/components/ui/scroll-view";
import { Text } from "@/components/ui/text";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";

interface Product {
  id: number;
  title: string;
  artists?: { id: number; name: string; discogs_id: number; bio?: string | null }[];
  label?: { id: number; name: string; discogs_id: number; description?: string };
  cover_image?: string;
  price?: number;
}

const API_URL = "http://167.172.35.211/api/v1/records/";
const PAGE_SIZE = 6;

export default function SearchScreen() {
    const { query } = useLocalSearchParams<{ query?: string }>();
    const q = query?.toLowerCase() || "";
    const [products, setProducts] = useState<Product[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const isFetching = useRef(false);

    useEffect(() => {
        if (!q) {
            setProducts([]);
            setLoading(false);
            setHasMore(false);
            setPage(1);
            return;
        }
        setLoading(true);
        setError(null);
        fetch(`${API_URL}?search=${encodeURIComponent(q)}&page=1`)
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
    }, [q]);

    const loadMore = () => {
        if (!hasMore || isFetching.current || !q) return;
        isFetching.current = true;
        fetch(`${API_URL}?search=${encodeURIComponent(q)}&page=${page}`)
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

    return (
        <ScrollView className="min-h-screen" onScroll={handleScroll} scrollEventThrottle={16}>
            <Box className="p-4">
                <Text bold className="mb-4">Результаты по: "{query}"</Text>
                {loading && <Text>Загрузка...</Text>}
                {error && <Text className="text-red-500">{error}</Text>}
                {!loading && !error && products.length === 0 && (
                    <Text>Ничего не найдено</Text>
                )}
                {!loading && !error && products.length > 0 && <ProductList products={products} />}
                {hasMore && !loading && (
                    <Text className="text-center text-gray-400 mt-4">Прокрутите вниз для загрузки ещё...</Text>
                )}
            </Box>
        </ScrollView>
    );
}
