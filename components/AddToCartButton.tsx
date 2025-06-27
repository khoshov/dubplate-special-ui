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

    return inCart ? (
        <Button key="in-cart" disabled className="flex flex-row items-center gap-2 rounded-full bg-green-500 px-4 py-2">
            <WhiteCheckIcon className="w-4 h-4 text-white" />
            <Text className="text-white font-semibold">В корзине</Text>
        </Button>
    ) : (
        <Button key="add" onPress={() => addToCart(product)} className="flex flex-row items-center gap-2 rounded-full bg-primary-500 hover:bg-primary-600 active:bg-primary-700 px-4 py-2">
            <AddIcon className="w-4 h-4 text-white" />
            <Text className="text-white font-semibold">В корзину</Text>
        </Button>
    );
}
