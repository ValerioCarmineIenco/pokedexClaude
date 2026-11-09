import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTabBarInset } from '@/components/navigation/TabBar';
import { CategoryTile, ListRow, Panel, ScreenHeader } from '@/components/ui';
import { getSection, MORE_SECTIONS } from '@/navigation/sections';
import { colors } from '@/theme/colors';
import { SECTION_COLORS } from '@/theme/sectionColors';
import { themedStyles } from '@/theme/styles';

type MoreSectionKey = (typeof MORE_SECTIONS)[number];

type Props = {
  /** Riga sotto «Temi e icona»: il tema e l'icona scelti («Notte · icona Classica»). */
  appearanceSummary: string;
  onOpenSection: (section: MoreSectionKey) => void;
  onOpenThemes: () => void;
  onOpenPremium: () => void;
  onOpenSettings: () => void;
};

/** Scheda Altro: i riquadri delle altre sezioni, poi Temi, Premium e Impostazioni. */
export function MoreView({
  appearanceSummary,
  onOpenSection,
  onOpenThemes,
  onOpenPremium,
  onOpenSettings,
}: Props) {
  const { t } = useTranslation('common');
  const insets = useSafeAreaInsets();
  const bottomInset = useTabBarInset();

  // Due riquadri per riga.
  const rows: MoreSectionKey[][] = [];
  for (let i = 0; i < MORE_SECTIONS.length; i += 2) rows.push(MORE_SECTIONS.slice(i, i + 2));

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 24, paddingBottom: bottomInset },
      ]}>
      <ScreenHeader title={t('more.title')} />
      <View style={styles.grid}>
        {rows.map((row) => (
          <View key={row.join('-')} style={styles.row}>
            {row.map((key) => {
              const section = getSection(key);
              return (
                <CategoryTile
                  key={key}
                  label={section.title}
                  icon={section.icon ?? 'more'}
                  color={SECTION_COLORS[key]}
                  onPress={() => onOpenSection(key)}
                />
              );
            })}
          </View>
        ))}
      </View>
      <Panel flush>
        <ListRow
          icon="palette"
          title={t('more.themes')}
          subtitle={appearanceSummary}
          onPress={onOpenThemes}
        />
        <ListRow
          divider
          icon="star"
          tone="accent"
          title={t('more.premium')}
          subtitle={t('more.premiumHint')}
          onPress={onOpenPremium}
        />
        <ListRow
          divider
          icon="settings"
          title={t('more.settings')}
          subtitle={t('more.settingsHint')}
          onPress={onOpenSettings}
        />
      </Panel>
    </ScrollView>
  );
}

const styles = themedStyles(() => ({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 18, gap: 20 },
  grid: { gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
}));
