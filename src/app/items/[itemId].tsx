import { useLocalSearchParams } from 'expo-router';

import { ItemDetailScreen } from '@/components/items/ItemDetailScreen';

export default function ItemDetailRoute() {
  const { itemId } = useLocalSearchParams<{ itemId: string }>();
  const id = Number(itemId);
  return <ItemDetailScreen itemId={Number.isInteger(id) && id > 0 ? id : null} />;
}
