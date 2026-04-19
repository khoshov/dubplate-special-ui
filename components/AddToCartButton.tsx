import { Button } from "@/components/ui/button";
import { AddIcon, WhiteCheckIcon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useCart } from "@/hooks/CartContext";

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

    const handlePress = () => {
        addToCart(product);
    };

    return (
        <>
            {inCart ? (
                <Button 
                    disabled 
                    className="w-full flex flex-row items-center justify-center gap-2 rounded-md bg-zinc-100 border border-zinc-200 px-4 py-2.5"
                >
                    <WhiteCheckIcon className="w-4 h-4 text-zinc-500" />
                    <Text className="text-zinc-500 font-medium text-sm">В корзине</Text>
                </Button>
            ) : (
                <Button 
                    onPress={handlePress}
                    className="w-full flex flex-row items-center justify-center gap-2 rounded-md bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 px-4 py-2.5"
                >
                    <AddIcon className="w-4 h-4 text-white" />
                    <Text className="text-white font-medium text-sm">В корзину</Text>
                </Button>
            )}
        </>
    );
}
