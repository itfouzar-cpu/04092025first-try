
'use server';

import { db } from '@/lib/firebase-admin';
import { type DocumentData, type Timestamp } from 'firebase-admin/firestore';

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  colors: string[];
  imageUrl: string;
  modelUrl?: string; // Optional: not all products might have a 3D model
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  // Firebase may return Timestamps for date fields
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

function mapDocToProduct(doc: DocumentData): Product {
    const data = doc.data();
    return {
        id: doc.id,
        name: data.name || '',
        price: data.price || 0,
        description: data.description || '',
        colors: data.colors || [],
        imageUrl: data.imageUrl || '',
        modelUrl: data.modelUrl,
        dimensions: data.dimensions || { width: 0, height: 0, depth: 0 },
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
    };
}

export async function getProducts(): Promise<Product[]> {
  try {
    const snapshot = await db.collection('products').orderBy('createdAt', 'desc').get();
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(mapDocToProduct);
  } catch (error) {
    console.error('Error fetching products:', error);
    // In a real app, you'd want more robust error handling
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const doc = await db.collection('products').doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return mapDocToProduct(doc as DocumentData);
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    return null;
  }
}
