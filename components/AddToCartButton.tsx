import {Button} from "@/components/ui/button";
import {Text} from "@/components/ui/text";
import {useCart} from "@/hooks/useCart";

export default function AddToCartButton({product}) {
    const {addToCart} = useCart();

    return (
        <Button onPress={() => addToCart(product)}>
            <Text>Добавить в корзину</Text>
        </Button>
    );
}
