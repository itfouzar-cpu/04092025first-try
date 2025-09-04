
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Share2, Heart, ShoppingCart, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getProductById, type Product } from '@/services/product-service';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/components/ui/use-toast';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);

  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedProduct = await getProductById(productId);
        if (fetchedProduct) {
          setProduct(fetchedProduct);
          if (fetchedProduct.colors && fetchedProduct.colors.length > 0) {
            setSelectedColor(fetchedProduct.colors[0]);
          }
        } else {
          setError('Product not found.');
        }
      } catch (err) {
        setError('Failed to fetch product data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        color: selectedColor,
        quantity: 1,
      });
      toast({
        title: 'Added to Cart',
        description: `${product.name} has been added to your cart.`,
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">{error || 'Product could not be loaded.'}</h1>
        <Link href="/products" passHref>
          <Button variant="link">Back to collection</Button>
        </Link>
      </div>
    );
  }

  const arUrl = `/ar?modelId=${product.id}&color=${selectedColor || ''}`;

  return (
    <div className="bg-animated-gradient min-h-[calc(100vh-65px)]">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/products" passHref>
            <Button variant="ghost">
              <ArrowLeft className="mr-2" />
              Back to Collection
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div className="aspect-square rounded-lg overflow-hidden bg-card shadow-lg">
            <Image
              src={product.imageUrl || `https://picsum.photos/600/600?random=${product.id}`}
              alt={product.name}
              width={600}
              height={600}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="flex flex-col h-full">
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">{product.name}</h1>
            <p className="text-3xl font-bold text-primary mb-4">${product.price.toFixed(2)}</p>
            <p className="text-muted-foreground text-lg mb-6">
              {product.description}
            </p>

            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <Label className="text-lg font-medium mb-2 block">Color</Label>
                <RadioGroup
                  defaultValue={selectedColor}
                  onValueChange={setSelectedColor}
                  className="flex flex-wrap gap-2"
                >
                  {product.colors.map((color) => (
                    <Label
                      key={color}
                      htmlFor={color}
                      className={`flex items-center justify-center rounded-md border-2 px-4 py-2 text-sm font-medium cursor-pointer transition-colors ${selectedColor === color ? 'border-primary ring-2 ring-primary' : 'border-border'}`}
                    >
                      <RadioGroupItem value={color} id={color} className="sr-only" />
                      {color}
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            )}
            
            <div className="mt-auto pt-6">
              <div className="flex flex-col gap-4">
                <Link href={arUrl} passHref>
                  <Button size="lg" className="w-full bg-primary/90 hover:bg-primary text-primary-foreground text-lg">
                    Lancer l'expérience AR
                  </Button>
                </Link>
                <div className='flex gap-4'>
                    <Button size="lg" variant="outline" className="w-full" onClick={handleAddToCart}>
                        <ShoppingCart className="mr-2" />
                        Add to Cart
                    </Button>
                    <Button size="icon" variant="outline">
                        <Heart />
                    </Button>
                    <Button size="icon" variant="outline">
                        <Share2 />
                    </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

    