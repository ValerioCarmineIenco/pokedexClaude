import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getArtworkUrl } from '@/api/pokemon';
import { colors } from '@/theme/colors';
import { SECTION_COLORS } from '@/theme/sectionColors';
import { themedStyles } from '@/theme/styles';
import { useThemePreference } from '@/theme/themeStore';
import { TYPE_COLORS } from '@/theme/typeColors';
import type { ThemeId } from '@/theme/themes';
import type { StatName } from '@/types/pokemon';

import { AppText } from './AppText';
import { Button } from './Button';
import { CategoryTile } from './CategoryTile';
import { Chip } from './Chip';
import { IconButton } from './IconButton';
import { ListRow } from './ListRow';
import { Panel } from './Panel';
import { ScreenHeader } from './ScreenHeader';
import { SectionHeader } from './SectionHeader';
import { SegmentedControl } from './SegmentedControl';
import { StatTile } from './StatTile';
import { TypeCard } from './TypeCard';
import { TypePill } from './TypePill';

/** Temi gratuiti da provare al volo: i premium ricadrebbero su Classico senza acquisto. */
const PREVIEW_THEMES: ThemeId[] = ['night', 'classic', 'ocean'];

const CHARIZARD_STATS: [StatName, number][] = [
  ['hp', 78],
  ['attack', 84],
  ['defense', 78],
  ['special-attack', 109],
  ['special-defense', 85],
  ['speed', 100],
];

type Tab = 'info' | 'evolutions' | 'moves' | 'forms';

type Props = { onBack: () => void };

/**
 * Catalogo dei componenti base del design 2.0, per provarli nei temi e confrontarli coi
 * prototipi. Solo nelle build di sviluppo (vedi `app/design.tsx`).
 */
export function DesignCatalogView({ onBack }: Props) {
  const { t } = useTranslation(['design', 'settings', 'common', 'pokemon', 'teams']);
  const insets = useSafeAreaInsets();
  const [preference, setPreference] = useThemePreference();
  const [chip, setChip] = useState<'all' | 'favorites' | 'shiny'>('all');
  const [tab, setTab] = useState<Tab>('info');

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
      ]}>
      <ScreenHeader
        title={t('design:title')}
        onBack={onBack}
        backLabel={t('design:back')}
      />
      <AppText color={colors.textMuted}>{t('design:hint')}</AppText>

      <View style={styles.row}>
        {PREVIEW_THEMES.map((id) => (
          <Chip
            key={id}
            label={t(`settings:themes.names.${id}`)}
            selected={preference === id}
            onPress={() => setPreference(id)}
          />
        ))}
      </View>

      <SectionHeader title={t('design:sections.headers')} />
      <ScreenHeader title={'Poké\ndex'} meta={['1025 Pokémon', '✦ 12 shiny · ♥ 8']} />
      <ScreenHeader
        title={t('common:screens.teams')}
        action={<Button label={t('teams:list.new')} icon="plus" />}
      />

      <SectionHeader title={t('design:sections.typography')} />
      <View style={styles.stack}>
        <AppText variant="hero">Pokédex</AppText>
        <AppText variant="title">Charizard</AppText>
        <AppText variant="heading">Bulbasaur</AppText>
        <AppText variant="label" color={colors.textMuted}>
          {t('design:demo.strengths')}
        </AppText>
        <AppText variant="bodyStrong">{t('settings:themes.title')}</AppText>
        <AppText>{t('design:demo.body')}</AppText>
        <AppText variant="caption" color={colors.textMuted}>
          {t('design:demo.sample')}
        </AppText>
      </View>

      <SectionHeader title={t('design:sections.cards')} />
      <View style={styles.stack}>
        <TypeCard id={1} name="Bulbasaur" types={['grass', 'poison']} artworkUrl={getArtworkUrl(1)} />
        <TypeCard id={6} name="Charizard" types={['fire', 'flying']} artworkUrl={getArtworkUrl(6)} />
        <TypeCard id={7} name="Squirtle" types={['water']} artworkUrl={getArtworkUrl(7)} />
        <TypeCard id={25} name="Pikachu" types={['electric']} artworkUrl={getArtworkUrl(25)} />
      </View>

      <SectionHeader title={t('design:sections.chips')} />
      <View style={styles.row}>
        <Chip label={t('design:demo.all')} selected={chip === 'all'} onPress={() => setChip('all')} />
        <Chip
          label={t('design:demo.favorites')}
          icon="heart"
          selected={chip === 'favorites'}
          onPress={() => setChip('favorites')}
        />
        <Chip
          label="Shiny"
          icon="sparkles"
          selected={chip === 'shiny'}
          onPress={() => setChip('shiny')}
        />
      </View>
      <View style={styles.row}>
        <TypePill type="fire" />
        <TypePill type="flying" />
        <TypePill type="electric" suffix="×3" />
        <TypePill type="rock" suffix="×2" />
      </View>

      <SectionHeader title={t('design:sections.buttons')} />
      <View style={styles.row}>
        <Button label={t('teams:list.new')} icon="plus" />
        <Button label={t('design:demo.secondary')} variant="secondary" />
        <Button label={t('design:demo.inverted')} variant="inverted" />
        <Button label={t('design:demo.disabled')} disabled />
      </View>
      <View style={styles.row}>
        <IconButton icon="back" accessibilityLabel={t('design:back')} />
        <View style={[styles.veilBackdrop, { backgroundColor: TYPE_COLORS.fire }]}>
          <IconButton icon="heart" variant="veil" accessibilityLabel={t('design:demo.favorites')} />
          <IconButton icon="sparkles" variant="veil" accessibilityLabel={t('pokemon:shiny.show')} />
        </View>
      </View>

      <SectionHeader title={t('design:sections.tabs')} />
      <SegmentedControl<Tab>
        value={tab}
        onChange={setTab}
        options={[
          { value: 'info', label: t('pokemon:tabs.info') },
          { value: 'evolutions', label: t('pokemon:tabs.evolutions') },
          { value: 'moves', label: t('pokemon:tabs.moves') },
          { value: 'forms', label: t('pokemon:forms.title') },
        ]}
      />

      <SectionHeader title={t('design:sections.stats')} />
      <View style={styles.grid}>
        {CHARIZARD_STATS.map(([stat, value]) => (
          <View key={stat} style={styles.gridCell}>
            <StatTile
              value={value}
              label={t(`common:stats.${stat}`)}
              ratio={value / 160}
              color={TYPE_COLORS.fire}
            />
          </View>
        ))}
      </View>

      <SectionHeader title={t('design:sections.panels')} />
      <Panel>
        <SectionHeader title={t('design:demo.team')} trailing="6/6" />
        <SectionHeader title={t('design:demo.strengths')} variant="eyebrow" />
        <View style={styles.row}>
          <TypePill type="grass" />
          <TypePill type="water" />
          <TypePill type="flying" />
        </View>
        <SectionHeader title={t('design:demo.weaknesses')} variant="eyebrow" />
        <View style={styles.row}>
          <TypePill type="electric" suffix="×3" />
          <TypePill type="rock" suffix="×2" />
        </View>
      </Panel>

      <SectionHeader title={t('design:sections.rows')} />
      <Panel flush>
        <ListRow
          icon="palette"
          title={t('settings:themes.title')}
          subtitle={t('settings:themes.names.night')}
          onPress={() => {}}
        />
        <ListRow
          icon="star"
          tone="accent"
          title={t('common:screens.premium')}
          subtitle={t('settings:appearance.premiumHint')}
          onPress={() => {}}
          divider
        />
        <ListRow
          icon="settings"
          title={t('common:screens.settings')}
          subtitle={t('settings:language.title')}
          onPress={() => {}}
          divider
        />
      </Panel>

      <SectionHeader title={t('design:sections.tiles')} />
      <View style={styles.tiles}>
        <View style={styles.row}>
          <CategoryTile label={t('common:screens.items')} icon="bag" color={SECTION_COLORS.items} />
          <CategoryTile
            label={t('common:screens.abilities')}
            icon="sparkles"
            color={SECTION_COLORS.abilities}
          />
        </View>
        <View style={styles.row}>
          <CategoryTile label={t('common:screens.natures')} icon="leaf" color={SECTION_COLORS.natures} />
          <CategoryTile
            label={t('common:screens.locations')}
            icon="location"
            color={SECTION_COLORS.locations}
          />
        </View>
        <View style={styles.row}>
          <CategoryTile label={t('common:screens.types')} icon="types" color={SECTION_COLORS.types} />
          <CategoryTile
            label={t('common:screens.compare')}
            icon="compare"
            color={SECTION_COLORS.compare}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = themedStyles(() => ({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 18, gap: 18 },
  stack: { gap: 12 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridCell: { width: '31%', flexGrow: 1 },
  tiles: { gap: 10 },
  veilBackdrop: { flexDirection: 'row', gap: 10, padding: 10, borderRadius: 32 },
}));
