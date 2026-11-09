import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TabBarButton, tabBarBottom, tabBarStyles } from '@/components/navigation/TabBar';

/**
 * Le quattro sezioni principali con la barra in basso (design «Collezione»): Pokédex, Mosse,
 * Squadre e Altro. Schede, dettagli e le sezioni aperte da Altro si aprono sopra, senza barra.
 */
export default function TabsLayout() {
  const { t } = useTranslation('common');
  const insets = useSafeAreaInsets();
  return (
    <Tabs>
      <TabSlot />
      {/* I TabTrigger devono essere figli diretti del TabList: definiscono anche le rotte. */}
      <TabList
        accessibilityRole="tablist"
        style={[tabBarStyles.bar, { bottom: tabBarBottom(insets.bottom) }]}>
        <TabTrigger name="index" href="/" asChild>
          <TabBarButton label={t('tabs.pokedex')} />
        </TabTrigger>
        <TabTrigger name="moves" href="/moves" asChild>
          <TabBarButton label={t('tabs.moves')} icon="bolt" />
        </TabTrigger>
        <TabTrigger name="teams" href="/teams" asChild>
          <TabBarButton label={t('tabs.teams')} icon="team" />
        </TabTrigger>
        <TabTrigger name="more" href="/more" asChild>
          <TabBarButton label={t('tabs.more')} icon="more" />
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}
