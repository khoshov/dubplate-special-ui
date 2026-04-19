// components/ProductList.tsx
import { Grid, GridItem } from "@/components/ui/grid";
import ProductCard from "./ProductCard";

interface Product {
  id: number;
  title: string;
  artists?: { id: number; name: string; discogs_id: number; bio?: string | null }[];
  label?: { id: number; name: string; discogs_id: number; description?: string };
  cover_image?: string;
  price?: number;
}

// Responsive grid: 1 col (xs), 2 col (sm), 4 col (md), 6 col (lg+)
// grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6
// col-span-1 for all
export default function ProductList({ products }: { products: Product[] }) {
  return (
    <Grid _extra={{ className: "grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4" }}>
      {products.map((p: Product, index: number) => (
        <GridItem key={p.id} _extra={{ className: "col-span-1 h-full" }}>
          <ProductCard product={p} index={index} />
        </GridItem>
      ))}
    </Grid>
  );
}
