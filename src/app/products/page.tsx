
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getProducts, type Product } from '@/services/product-service';

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Link href="/" passHref>
          <Button variant="ghost" size="icon" className='mr-4'>
            <ArrowLeft />
          </Button>
        </Link>
        <h1 className="text-4xl font-bold tracking-tight">Our Collection</h1>
      </div>
      {products.length === 0 ? (
        <div className="text-center py-16">
            <h2 className="text-2xl font-semibold">No Products Found</h2>
            <p className="text-muted-foreground mt-2">Check back later or contact support if you believe this is an error.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product: Product) => (
            <Link key={product.id} href={`/products/${product.id}`} passHref>
              <Card className="overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="p-0">
                  <Image
                    src={product.imageUrl || `https://picsum.photos/400/300?random=${product.id}`}
                    alt={product.name}
                    width={400}
                    height={300}
                    className="object-cover w-full h-full aspect-[4/3]"
                  />
                </CardHeader>
                <CardContent className="p-4 flex flex-col flex-grow">
                  <h2 className="text-lg leading-tight font-semibold flex-grow">{product.name}</h2>
                  <p className="text-lg font-bold text-primary mt-2">${product.price.toFixed(2)}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
