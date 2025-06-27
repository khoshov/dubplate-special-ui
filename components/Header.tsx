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
        <Box className="px-4 py-3 border-b border-gray-200 bg-white">
            {/* 👑 Логотип + поиск */}
            <HStack space="md" className="mb-2 items-center">
                <Pressable onPress={() => router.push("/")}>
                    <Text size="lg" bold className="mr-2">Dubplate Special</Text>
                </Pressable>
                <Input className="flex-1 max-w-lg" size="md" variant="rounded">
                    <InputField
                        placeholder="Поиск..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        returnKeyType="search"
                        onSubmitEditing={handleSearch}
                        className="text-base"
                    />
                    <InputSlot>
                        <Button
                            size="sm"
                            variant="solid"
                            action="primary"
                            onPress={handleSearch}
                            className="rounded-full p-0 w-9 h-9 flex items-center justify-center transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-400"
                            aria-label="Поиск"
                        >
                            <SearchIcon className="w-5 h-5 text-white" />
                        </Button>
                    </InputSlot>
                </Input>
                <Pressable onPress={() => router.push({ pathname: '/cart' } as any)}
                    className="relative ml-2 p-2 rounded-full hover:bg-primary-50 active:bg-primary-100 transition-colors">
                    <CartIcon className="w-6 h-6 text-primary-700" />
                    {items.length > 0 && (
                        <Box className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center">
                            <Text className="text-white text-xs font-bold">{items.length}</Text>
                        </Box>
                    )}
                </Pressable>
            </HStack>

            {/* 🗂 Категории */}
            <Box className="px-2 overflow-x-auto">
                <Box className="flex gap-2 flex-row justify-center flex-nowrap sm:flex-wrap">
                    {catLoading && <Text>Загрузка...</Text>}
                    {catError && <Text className="text-red-500">{catError}</Text>}
                    {!catLoading && !catError && categories.map((cat) => (
                        <Pressable
                            key={cat.id}
                            onPress={() => router.push(`/category/${toSlug(cat.name)}?name=${encodeURIComponent(cat.name)}`)}
                            className="bg-primary-50 hover:bg-primary-100 active:bg-primary-200 transition-colors px-3 py-1 rounded-full shadow-sm border border-primary-100 whitespace-nowrap"
                        >
                            <Text className="text-primary-700 text-sm font-medium">{cat.name}</Text>
                        </Pressable>
                    ))}
                </Box>
            </Box>
        </Box>
    );
}
