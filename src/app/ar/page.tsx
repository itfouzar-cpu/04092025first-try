
'use client';

import { useEffect, useRef, useState, type ComponentProps } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader, CameraOff, ArrowLeft, Move, Rotate3d, Scale, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';
import { Canvas } from '@react-three/fiber';
import { Box, OrbitControls } from '@react-three/drei';
import dynamic from 'next/dynamic';
import { autoScaleArPlacement, type AutoScaleArPlacementInput } from '@/ai/flows/auto-scale-ar-placement';
import { getProductById, type Product } from '@/services/product-service';
import { Card, CardContent } from '@/components/ui/card';

function Model(props: ComponentProps<typeof Box>) {
    const ref = useRef<any>();
    return (
        <Box ref={ref} {...props}>
            <meshStandardMaterial color={props.material?.color || 'orange'} />
        </Box>
    );
}

function ARPageComponent() {
    const searchParams = useSearchParams();
    const modelId = searchParams.get('modelId');
    const color = searchParams.get('color')?.toLowerCase() || 'lightgray';

    const videoRef = useRef<HTMLVideoElement>(null);
    const [product, setProduct] = useState<Product | null>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const { toast } = useToast();

    const [position, setPosition] = useState<[number, number, number]>([0, 0, -5]);
    const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);
    const [scale, setScale] = useState(1);
    const [isPlacing, setIsPlacing] = useState(false);
    const [isAiPlacing, setIsAiPlacing] = useState(false);
    const [aiReasoning, setAiReasoning] = useState('');
    const [controlMode, setControlMode] = useState<'translate' | 'rotate' | 'scale'>('translate');
    
    useEffect(() => {
        const getCameraPermission = async () => {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                toast({
                    variant: 'destructive',
                    title: 'AR Not Supported',
                    description: 'Your browser does not support the necessary features for AR.',
                });
                setHasCameraPermission(false);
                return;
            }

            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setHasCameraPermission(true);
            } catch (error) {
                console.error('Error accessing camera:', error);
                setHasCameraPermission(false);
                toast({
                    variant: 'destructive',
                    title: 'Camera Access Denied',
                    description: 'Please enable camera permissions in your browser settings to use the AR feature.',
                });
            }
        };

        const fetchProduct = async () => {
            if(modelId) {
                const fetchedProduct = await getProductById(modelId);
                setProduct(fetchedProduct);
            }
        }

        getCameraPermission();
        fetchProduct();
    }, [toast, modelId]);


    const handleAiPlace = async () => {
        if (!videoRef.current || !product) return;
        setIsAiPlacing(true);
        setAiReasoning('');

        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if(!ctx) {
            setIsAiPlacing(false);
            return;
        }

        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const sceneImage = canvas.toDataURL('image/jpeg');

        try {
            const input: AutoScaleArPlacementInput = {
                sceneImage,
                objectType: product.name,
                objectDimensions: product.dimensions,
            }
            const result = await autoScaleArPlacement(input);
            setPosition([result.placement.position.x, result.placement.position.y, result.placement.position.z]);
            setRotation([0, result.placement.rotation, 0]);
            setScale(result.scale);
            setAiReasoning(result.reasoning);
            setIsPlacing(true);
            toast({
                title: "AI Placement Complete",
                description: "The object has been placed in the scene."
            })
        } catch (error) {
            console.error('AI placement failed:', error);
            toast({
                variant: 'destructive',
                title: 'AI Placement Failed',
                description: 'Could not automatically place the object. Please try again.',
            });
        } finally {
            setIsAiPlacing(false);
        }
    };


    const handleSliderChange = (value: number[]) => {
        const [val] = value;
        if (controlMode === 'translate') {
            const newPos: [number, number, number] = [...position];
            // Simple example: slider controls Y position (vertical)
            newPos[1] = val; 
            setPosition(newPos);
        } else if (controlMode === 'rotate') {
             const newRot: [number, number, number] = [...rotation];
             newRot[1] = val * (Math.PI / 180); // Y-axis rotation
             setRotation(newRot);
        } else if (controlMode === 'scale') {
            setScale(val);
        }
    }

    return (
        <div className="relative w-full h-screen bg-black">
            <Link href={`/products/${modelId || ''}`} passHref>
                <Button variant="ghost" size="icon" className="absolute top-4 left-4 z-20 text-white bg-black/50 hover:bg-black/70 hover:text-white">
                    <ArrowLeft />
                </Button>
            </Link>

            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" autoPlay muted playsInline />

            {hasCameraPermission === true && (
                <div className="absolute inset-0 z-10">
                    <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
                        <ambientLight intensity={1.5} />
                        <directionalLight position={[10, 10, 5]} intensity={2} />
                         {isPlacing && <Model position={position} rotation={rotation} scale={scale} material={{ color }} />}
                         <OrbitControls enabled={isPlacing} enableZoom={false} enablePan={true} />
                    </Canvas>
                </div>
            )}


            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
                {hasCameraPermission === null && (
                    <div className="text-center text-white bg-black/50 p-6 rounded-lg pointer-events-auto">
                        <Loader className="animate-spin mx-auto mb-4" size={48} />
                        <p>Requesting Camera Access...</p>
                    </div>
                )}

                {hasCameraPermission === false && (
                    <div className="text-center text-white pointer-events-auto">
                        <Alert variant="destructive" className="max-w-sm">
                            <CameraOff className="h-4 w-4" />
                            <AlertTitle>Camera Access Required</AlertTitle>
                            <AlertDescription>
                                Please allow camera access in your browser to use the AR feature. You may need to refresh the page.
                            </AlertDescription>
                        </Alert>
                    </div>
                )}
            </div>
            
            {hasCameraPermission && !isPlacing && (
                 <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col gap-4 items-center">
                    <Button size="lg" onClick={() => setIsPlacing(true)} disabled={isAiPlacing}>
                        Place Manually
                    </Button>
                    <Button size="lg" onClick={handleAiPlace} disabled={isAiPlacing} variant="outline" className='bg-background/80'>
                        {isAiPlacing ? <Loader className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                        AI Place
                    </Button>
                </div>
            )}
            
            {aiReasoning && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 w-full max-w-md px-4">
                    <Card className="bg-background/80 text-foreground">
                        <CardContent className="p-3">
                            <p className="text-xs font-medium">✨ AI Suggestion</p>
                            <p className="text-xs text-muted-foreground">{aiReasoning}</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {hasCameraPermission && isPlacing && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 w-full max-w-sm px-4">
                    <div className="bg-black/60 backdrop-blur-sm p-4 rounded-lg flex flex-col gap-4">
                         <div className="flex justify-around">
                             <Button size="icon" variant={controlMode === 'translate' ? 'secondary' : 'ghost'} onClick={() => setControlMode('translate')} className='text-white'><Move/></Button>
                             <Button size="icon" variant={controlMode === 'rotate' ? 'secondary' : 'ghost'} onClick={() => setControlMode('rotate')} className='text-white'><Rotate3d/></Button>
                             <Button size="icon" variant={controlMode === 'scale' ? 'secondary' : 'ghost'} onClick={() => setControlMode('scale')} className='text-white'><Scale/></Button>
                         </div>
                         {controlMode === 'translate' && <Slider defaultValue={[position[1]]} min={-5} max={5} step={0.1} onValueChange={handleSliderChange} />}
                         {controlMode === 'rotate' && <Slider defaultValue={[rotation[1] * (180/Math.PI)]} min={-180} max={180} step={1} onValueChange={handleSliderChange} />}
                         {controlMode === 'scale' && <Slider defaultValue={[scale]} min={0.1} max={3} step={0.05} onValueChange={handleSliderChange} />}
                    </div>
                </div>
            )}

            <div className="absolute top-4 right-4 z-20 bg-black/50 text-white p-2 rounded-md text-xs">
                <p>Product: {product?.name || "Loading..."}</p>
                <p>Color: {color}</p>
            </div>
        </div>
    );
}


const ARPage = dynamic(() => Promise.resolve(ARPageComponent), {
    ssr: false,
    loading: () => <div className="w-full h-screen bg-black flex items-center justify-center text-white"><Loader className="animate-spin" /></div>
});

export default ARPage;

    