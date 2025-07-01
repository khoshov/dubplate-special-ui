import { Box } from "@/components/ui/box";
import { Image } from "@/components/ui/image";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { useRouter } from "expo-router";
import AddToCartButton from "./AddToCartButton";
import Animated, { FadeInUp, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

// Define the Product type based on API structure
interface Product {
    id: number;
    title: string;
    artists?: { id: number; name: string; discogs_id: number; bio?: string | null }[];
    label?: { id: number; name: string; discogs_id: number; description?: string };
    cover_image?: string;
    price?: number;
}

export default function ProductCard({product, index = 0}: {product: Product, index?: number}) {
    const router = useRouter();
    const artistNames = product.artists ? product.artists.map((a: {name: string}) => a.name).join(", ") : "";
    const labelName = product.label ? product.label.name : "";
    const price = product.price !== undefined ? product.price : "—";
    
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }]
        };
    });
    
    const handlePressIn = () => {
        scale.value = withSpring(0.95);
    };
    
    const handlePressOut = () => {
        scale.value = withSpring(1);
    };
    return (
        <Animated.View 
            entering={FadeInUp.delay(index * 100).springify()}
            style={animatedStyle}
        >
            <Box className="group relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 mb-6 overflow-hidden border border-gray-100">
                {/* Гловинг эффект */}
                <Box className="absolute inset-0 bg-gradient-to-t from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none" />
                
                <Pressable 
                    className="w-full" 
                    onPress={() => router.push(`/product/${product.id}`)}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                >
                    {/* Обложка */}
                    <Box className="relative w-full aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                        <Image 
                            source={{uri: product.cover_image}} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Приценный бедж */}
                        {price !== "—" && (
                            <Box className="absolute top-3 right-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1 rounded-full shadow-lg backdrop-blur-sm">
                                <Text className="text-white text-sm font-bold">{price}₽</Text>
                            </Box>
                        )}
                    </Box>
                    
                    {/* Контент */}
                    <Box className="p-4 space-y-2">
                        <Text className="text-lg font-bold text-gray-800 leading-tight group-hover:text-purple-700 transition-colors duration-150">
                            {artistNames} - {product.title}
                        </Text>
                        {labelName && (
                            <Text className="text-sm text-gray-500 font-medium">
                                🏾 {labelName}
                            </Text>
                        )}
                    </Box>
                </Pressable>
                
                {/* Кнопка в корзину */}
                <Box className="p-4 pt-0">
                    <AddToCartButton product={product} />
                </Box>
                
                {/* Декоративный элемент */}
                <Box className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 opacity-0" />
            </Box>
        </Animated.View>
    );
}
