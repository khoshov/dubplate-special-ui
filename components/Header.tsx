import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { CartIcon, SearchIcon } from "@/components/ui/icon";
import { Input, InputField, InputSlot } from "@/components/ui/input";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { API_HOST } from "@/constants/api";
import { useCart } from "@/hooks/CartContext";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import Animated, { FadeInDown, SlideInLeft, BounceIn } from 'react-native-reanimated';

const API_CATEGORIES = `${API_HOST}/api/v1/styles/`;

export default function Header() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
    const [catLoading, setCatLoading] = useState(true);
    const [catError, setCatError] = useState<string | null>(null);
    const { items } = useCart();

    useEffect(() => {
        setCatLoading(true);
        setCatError(null);
        fetch(API_CATEGORIES)
            .then(res => {
                if (!res.ok) throw new Error("Ошибка загрузки категорий");
                return res.json();
            })
            .then(data => {
                setCategories(data);
                setCatLoading(false);
            })
            .catch(err => {
                setCatError(err.message || "Ошибка");
                setCatLoading(false);
            });
    }, []);

    const handleSearch = () => {
        if (searchQuery.trim()) {
            router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery("");
        }
    };

    const toSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-');

    return (
        <Box className="relative overflow-hidden">
            {/* Градиентный фон */}
            <Box className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-teal-500" />
            
            {/* Основной контент */}
            <Box className="relative px-4 py-4 backdrop-blur-sm bg-white/10">
                {/* 👑 Логотип + поиск */}
                <Animated.View entering={SlideInLeft.delay(200).springify()}>
                    <HStack space="md" className="mb-3 items-center">
                        <Pressable onPress={() => router.push("/")} className="hover:scale-105 active:scale-95 transition-transform">
                            <Text size="xl" bold className="mr-2 text-white drop-shadow-lg font-bold tracking-wide">🎵 Dubplate Special</Text>
                        </Pressable>
                        <Input className="flex-1 max-w-lg shadow-lg backdrop-blur-md bg-white/20 border-white/30" size="md" variant="rounded">
                            <InputField
                                placeholder="Найти винил..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                returnKeyType="search"
                                onSubmitEditing={handleSearch}
                                className="text-base text-white"
                                placeholderTextColor="#ffffff"
                            />
                            <InputSlot>
                                <Button
                                    size="sm"
                                    variant="solid"
                                    action="primary"
                                    onPress={handleSearch}
                                    className="rounded-full p-0 w-9 h-9 flex items-center justify-center bg-gradient-to-r from-pink-500 to-purple-600 shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                                    aria-label="Поиск"
                                >
                                    <SearchIcon className="w-5 h-5" stroke="white" fill="none" />
                                </Button>
                            </InputSlot>
                        </Input>
                        <Animated.View entering={BounceIn.delay(400)}>
                            <Pressable onPress={() => router.push({ pathname: '/cart' } as any)}
                                className="relative ml-2 p-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 active:bg-white/40 hover:scale-110 active:scale-95 transition-all duration-200 shadow-lg">
                                <CartIcon className="w-6 h-6" stroke="white" fill="none" />
                                {items.length > 0 && (
                                    <Animated.View 
                                        entering={BounceIn.springify()}
                                        className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-600 rounded-full w-6 h-6 flex items-center justify-center shadow-lg border-2 border-white"
                                    >
                                        <Text className="text-white text-xs font-bold">{items.length}</Text>
                                    </Animated.View>
                                )}
                            </Pressable>
                        </Animated.View>
                    </HStack>
                </Animated.View>

                {/* 🗂 Категории */}
                <Animated.View entering={FadeInDown.delay(600).springify()}>
                    <Box className="px-2 overflow-x-auto mt-2 pb-6">
                        <Box className="flex gap-3 flex-row justify-center flex-nowrap sm:flex-wrap py-3 px-2">
                            {catLoading && <Text className="text-white/80">Загрузка...</Text>}
                            {catError && <Text className="text-red-300">{catError}</Text>}
                            {!catLoading && !catError && categories.map((cat, index) => (
                                <Animated.View 
                                    key={cat.id} 
                                    entering={FadeInDown.delay(700 + index * 100).springify()}
                                    className="mx-1"
                                >
                                    <Pressable
                                        onPress={() => router.push(`/category/${toSlug(cat.name)}?name=${encodeURIComponent(cat.name)}`)}
                                        className="bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 active:bg-white/40 hover:scale-105 active:scale-95 transition-all duration-200 px-4 py-2 rounded-full shadow-lg whitespace-nowrap"
                                    >
                                        <Text className="text-white text-sm font-semibold drop-shadow-sm">{cat.name}</Text>
                                    </Pressable>
                                </Animated.View>
                            ))}
                        </Box>
                    </Box>
                </Animated.View>
            </Box>
        </Box>
    );
}
