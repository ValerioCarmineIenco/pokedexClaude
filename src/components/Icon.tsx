import { SymbolView } from 'expo-symbols';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';

type SymbolName = ComponentProps<typeof SymbolView>['name'];

const ICONS = {
  search: { ios: 'magnifyingglass', android: 'search', web: 'search' },
  close: { ios: 'xmark.circle.fill', android: 'close', web: 'close' },
  grid: { ios: 'square.grid.2x2.fill', android: 'grid_view', web: 'grid_view' },
  rows: { ios: 'list.bullet', android: 'view_agenda', web: 'view_agenda' },
  back: { ios: 'chevron.backward', android: 'arrow_back', web: 'arrow_back' },
  previous: { ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' },
  next: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
  offline: { ios: 'wifi.slash', android: 'wifi_off', web: 'wifi_off' },
  settings: { ios: 'gearshape.fill', android: 'settings', web: 'settings' },
  check: { ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' },
  expand: { ios: 'chevron.down', android: 'expand_more', web: 'expand_more' },
  bag: { ios: 'bag.fill', android: 'shopping_bag', web: 'shopping_bag' },
  sparkles: { ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' },
  bolt: { ios: 'bolt.fill', android: 'bolt', web: 'bolt' },
  leaf: { ios: 'leaf.fill', android: 'eco', web: 'eco' },
  location: { ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' },
  up: { ios: 'arrow.up', android: 'arrow_upward', web: 'arrow_upward' },
  down: { ios: 'arrow.down', android: 'arrow_downward', web: 'arrow_downward' },
  map: { ios: 'map.fill', android: 'map', web: 'map' },
  types: { ios: 'circle.hexagongrid.fill', android: 'category', web: 'category' },
  heart: { ios: 'heart.fill', android: 'favorite', web: 'favorite' },
  heartOutline: { ios: 'heart', android: 'favorite_border', web: 'favorite_border' },
} satisfies Record<string, SymbolName>;

export type IconName = keyof typeof ICONS;

type Props = {
  name: IconName;
  size?: number;
  color: ColorValue;
};

export function Icon({ name, size = 20, color }: Props) {
  return <SymbolView name={ICONS[name]} size={size} tintColor={color} weight="semibold" />;
}
