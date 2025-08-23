import { fetchItem, fetchItemChanges, fetchItemsByType } from '@/utils/api';
import ItemDetailsClient from '@/components/Items/ItemDetailsClient';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{
    type: string;
    name: string;
  }>;
}

export default async function ItemDetailsPage({ params }: Props) {
  const { type, name } = await params;
  const item = await fetchItem(type, name);
  
  if (!item) {
    notFound();
  }
  
  const initialChanges = await fetchItemChanges(String(item.id));
  const similarItemsPromise = fetchItemsByType(item.type);

  return <ItemDetailsClient 
    item={item} 
    initialChanges={initialChanges}
    similarItemsPromise={similarItemsPromise}
  />;
} 