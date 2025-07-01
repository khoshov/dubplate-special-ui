import { Button } from "@/components/ui/button";
import { AddIcon, WhiteCheckIcon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useCart } from "@/hooks/CartContext";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';

export type Product = {
    id: number;
    title: string;
    artists?: { id: number; name: string; discogs_id: number; bio?: string | null }[];
    label?: { id: number; name: string; discogs_id: number; description?: string };
    cover_image?: string;
    price?: number;
};

export default function AddToCartButton({product}: {product: Product}) {
    const {addToCart, items} = useCart();
    const inCart = items.some((item: Product) => item.id === product.id);
    
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }]
        };
    });
    
    const handlePress = () => {
        scale.value = withSequence(
            withSpring(0.8, { duration: 150 }),
            withSpring(1.1, { duration: 150 }),
            withSpring(1, { duration: 150 })
        );
        addToCart(product);
    };

    return (
        <Animated.View style={animatedStyle} className="w-full">
            {inCart ? (
                <Button 
                    key="in-cart" 
                    disabled 
                    className="w-full flex flex-row items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 shadow-lg"
                >
                    <WhiteCheckIcon className="w-5 h-5 text-white" />
                    <Text className="text-white font-bold text-base">В корзине</Text>
                </Button>
            ) : (
                <Button 
                    key="add" 
                    onPress={handlePress}
                    className="w-full flex flex-row items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 active:from-purple-800 active:to-pink-800 px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                    <AddIcon className="w-5 h-5 text-white" />
                    <Text className="text-white font-bold text-base">🛍️ В корзину</Text>
                </Button>
            )}
        </Animated.View>
    );
}
