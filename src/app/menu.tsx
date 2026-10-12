import { router, useLocalSearchParams } from 'expo-router';

import { SectionMenu } from '@/components/SectionMenu';
import { SECTIONS, type SectionKey } from '@/navigation/sections';

export default function SectionMenuSheet() {
  const { current } = useLocalSearchParams<{ current?: string }>();
  const currentKey: SectionKey =
    SECTIONS.find((section) => section.key === current)?.key ?? 'pokedex';

  return (
    <SectionMenu
      current={currentKey}
      onSelect={(section) => {
        if (section.key === currentKey) {
          router.back();
          return;
        }
        // Torna alla sezione se è già aperta, altrimenti la apre al posto del menu.
        router.dismissTo(section.href);
      }}
    />
  );
}
