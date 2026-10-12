import { Tabs } from 'expo-router/tabs';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { QueryProvider } from '@/api/QueryProvider';
import { FontsGate } from '@/components/FontsGate';
import { Icon } from '@/components/Icon';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';

/** Altezza della barra delle tab sopra la zona sicura in basso. */
const TAB_BAR_HEIGHT = 58;

export default function RootLayout() {
  const insets = useSafeAreaInsets();
  return (
    <QueryProvider>
      <FontsGate>
        <StatusBar style="dark" />
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: colors.accent,
            tabBarInactiveTintColor: colors.textSubtle,
            tabBarLabelStyle: { fontFamily: fonts.bodyBold, fontSize: 11, lineHeight: 14 },
            tabBarStyle: {
              backgroundColor: colors.surface,
              borderTopColor: colors.line,
              height: TAB_BAR_HEIGHT + insets.bottom,
              paddingTop: 6,
            },
            sceneStyle: { backgroundColor: colors.background },
          }}>
          <Tabs.Screen
            name="(pokedex)"
            options={{
              title: 'Pokédex',
              tabBarIcon: ({ color }) => <Icon name="grid" size={22} color={color} />,
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: 'Impostazioni',
              tabBarIcon: ({ color }) => <Icon name="settings" size={22} color={color} />,
            }}
          />
        </Tabs>
      </FontsGate>
    </QueryProvider>
  );
}
