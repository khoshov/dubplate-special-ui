import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { CartIcon, SearchIcon, UserIcon } from "@/components/ui/icon";
import { Input, InputField, InputSlot } from "@/components/ui/input";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { API_HOST } from "@/constants/api";
import { useCart } from "@/hooks/CartContext";
import { useAuth } from "@/hooks/AuthContext";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

const API_CATEGORIES = `${API_HOST}/api/v1/records/styles/`;

export default function Header() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
    const [catLoading, setCatLoading] = useState(true);
    const [catError, setCatError] = useState<string | null>(null);
    const { items } = useCart();
    const { isAuthenticated, user } = useAuth();

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
        <Box className="bg-white border-b border-zinc-200">
            <Box className="px-4 py-4">
                <HStack space="md" className="mb-3 items-center">
                    <Pressable onPress={() => router.push("/")}>
                        <Text size="xl" bold className="mr-2 text-zinc-900 font-bold tracking-tight">Dubplate Special</Text>
                    </Pressable>
                    <Input className="flex-1 max-w-lg bg-zinc-50 border-zinc-200" size="md" variant="outline">
                        <InputField
                            placeholder="Найти винил..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            returnKeyType="search"
                            onSubmitEditing={handleSearch}
                            className="text-base text-zinc-900"
                            placeholderTextColor="#a1a1aa"
                        />
                        <InputSlot>
                            <Button
                                size="sm"
                                variant="solid"
                                onPress={handleSearch}
                                className="rounded-md p-0 w-9 h-9 flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700"
                                aria-label="Поиск"
                            >
                                <SearchIcon className="w-4 h-4" stroke="white" fill="none" />
                            </Button>
                        </InputSlot>
                    </Input>
                    <Pressable 
                        onPress={() => router.push({ pathname: '/cart' } as any)}
                        className="relative ml-2 p-3 rounded-md border border-zinc-200 hover:bg-zinc-50 active:bg-zinc-100"
                    >
                        <CartIcon className="w-5 h-5" stroke="#18181b" fill="none" />
                        {items.length > 0 && (
                            <Box className="absolute -top-1.5 -right-1.5 bg-zinc-900 rounded-full w-5 h-5 flex items-center justify-center">
                                <Text className="text-white text-[10px] font-bold">{items.length}</Text>
                            </Box>
                        )}
                    </Pressable>
                    <Pressable 
                        onPress={() => router.push({ pathname: '/account' } as any)}
                        className="ml-1 p-3 rounded-md border border-zinc-200 hover:bg-zinc-50 active:bg-zinc-100"
                    >
                        {isAuthenticated && user ? (
                            <Box className="w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center">
                                <Text className="text-white text-[10px] font-bold">
                                    {(user.first_name?.[0] || user.phone_number?.[3] || "?").toUpperCase()}
                                </Text>
                            </Box>
                        ) : (
                            <UserIcon className="w-5 h-5" stroke="#18181b" fill="none" />
                        )}
                    </Pressable>
                </HStack>

                <Box className="px-2 overflow-x-auto pb-2">
                    <Box className="flex gap-2 flex-row justify-center flex-nowrap sm:flex-wrap py-2 px-1">
                        {catLoading && <Text className="text-zinc-400 text-sm">Загрузка...</Text>}
                        {catError && <Text className="text-red-500 text-sm">{catError}</Text>}
                        {!catLoading && !catError && categories.map((cat) => (
                            <Pressable
                                key={cat.id}
                                onPress={() => router.push(`/category/${toSlug(cat.name)}?name=${encodeURIComponent(cat.name)}`)}
                                className="bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 active:bg-zinc-200 px-4 py-1.5 rounded-md whitespace-nowrap"
                            >
                                <Text className="text-zinc-700 text-sm font-medium">{cat.name}</Text>
                            </Pressable>
                        ))}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
