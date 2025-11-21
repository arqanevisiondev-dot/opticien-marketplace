'use client';

import { use } from 'react';
import ProductEditForm from '@/app/admin/products/ProductEditForm';

interface AdminProductPageProps {
  params: Promise<{ id: string }>;
}

export default function AdminProductEditPage({ params }: AdminProductPageProps) {
  const { id } = use(params);
  return <ProductEditForm productId={id} />;
}
