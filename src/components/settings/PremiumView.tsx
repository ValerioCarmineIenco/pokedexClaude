import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PRODUCTS, type Product, type ProductId } from '@/purchases/catalog';
import { purchase, PURCHASES_SIMULATED, resetSimulatedPurchases, restore, usePurchases } from '@/purchases/store';
import { colors, radius } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { themedStyles } from '@/theme/styles';
import { THEMES } from '@/theme/themes';

import { Icon, type IconName } from '../Icon';
import { PokeBallLogo } from '../PokeBallLogo';

const PRODUCT_ICONS: Record<ProductId, IconName> = {
  pokedex_pro: 'star',
  remove_ads: 'noAds',
  style_pack: 'palette',
};

/** Negozio degli acquisti in-app: Pokédex Pro, Rimuovi pubblicità, Pacchetto stile. */
export function PremiumView({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation('settings');
  const insets = useSafeAreaInsets();
  const { owned } = usePurchases();
  const [busy, setBusy] = useState<ProductId | 'restore' | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const hasPro = owned.includes('pokedex_pro');

  async function buy(id: ProductId) {
    setBusy(id);
    setStatus(null);
    try {
      await purchase(id);
    } finally {
      setBusy(null);
    }
  }

  async function restorePurchases() {
    setBusy('restore');
    setStatus(null);
    try {
      const count = await restore();
      setStatus(count > 0 ? t('premium.restored', { count }) : t('premium.nothingToRestore'));
    } finally {
      setBusy(null);
    }
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }]}>
      <Pressable
        onPress={onBack}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={t('back')}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
        <Icon name="back" size={18} color={colors.text} />
      </Pressable>

      <View style={styles.hero}>
        <View style={styles.heroBalls}>
          {THEMES.filter((theme) => theme.premium).map((theme) => (
            <View key={theme.id} style={[styles.heroSwatch, { backgroundColor: theme.palette.accent }]} />
          ))}
        </View>
        <View style={styles.titleRow}>
          <PokeBallLogo size={26} />
          <Text style={styles.title} accessibilityRole="header">
            {t('premium.title')}
          </Text>
        </View>
        <Text style={styles.subtitle}>{t('premium.subtitle')}</Text>
      </View>

      <View style={styles.products}>
        {PRODUCTS.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            // Pro include tutto: anche gli altri due risultano già sbloccati.
            owned={owned.includes(product.id) || hasPro}
            busy={busy === product.id}
            disabled={busy !== null}
            onBuy={() => buy(product.id)}
          />
        ))}
      </View>

      <Pressable
        onPress={restorePurchases}
        disabled={busy !== null}
        accessibilityRole="button"
        style={({ pressed }) => [styles.restore, pressed && styles.pressed]}>
        {busy === 'restore' ? (
          <ActivityIndicator size="small" color={colors.accent} />
        ) : (
          <Icon name="restore" size={16} color={colors.accent} />
        )}
        <Text style={styles.restoreLabel}>{t('premium.restore')}</Text>
      </Pressable>
      {status ? (
        <Text style={styles.status} accessibilityLiveRegion="polite">
          {status}
        </Text>
      ) : null}

      {PURCHASES_SIMULATED ? (
        <View style={styles.simulated}>
          <Text style={styles.simulatedText}>{t('premium.simulated')}</Text>
          {owned.length > 0 ? (
            <Pressable onPress={resetSimulatedPurchases} accessibilityRole="button" hitSlop={6}>
              <Text style={styles.simulatedLink}>{t('premium.reset')}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </ScrollView>
  );
}

function ProductCard({
  product,
  owned,
  busy,
  disabled,
  onBuy,
}: {
  product: Product;
  owned: boolean;
  busy: boolean;
  disabled: boolean;
  onBuy: () => void;
}) {
  const { t } = useTranslation('settings');
  return (
    <View style={[styles.product, product.highlighted && styles.productHighlighted]}>
      {product.highlighted ? (
        <View style={styles.ribbon}>
          <Text style={styles.ribbonText}>{t('premium.bestValue')}</Text>
        </View>
      ) : null}
      <View style={styles.productHeader}>
        <View style={[styles.productIcon, product.highlighted && styles.productIconHighlighted]}>
          <Icon
            name={PRODUCT_ICONS[product.id]}
            size={20}
            color={product.highlighted ? colors.onAccent : colors.accent}
          />
        </View>
        <View style={styles.flex}>
          <Text style={styles.productTitle}>{t(`premium.products.${product.id}.title`)}</Text>
          <Text style={styles.productDescription}>{t(`premium.products.${product.id}.description`)}</Text>
        </View>
      </View>
      {owned ? (
        <View style={styles.ownedRow}>
          <Icon name="check" size={18} color={colors.statUp} />
          <Text style={styles.ownedLabel}>{t('premium.owned')}</Text>
        </View>
      ) : (
        <Pressable
          onPress={onBuy}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityState={{ disabled, busy }}
          style={({ pressed }) => [
            styles.buy,
            !product.highlighted && styles.buySecondary,
            pressed && styles.pressed,
          ]}>
          {busy ? (
            <ActivityIndicator size="small" color={product.highlighted ? colors.onAccent : colors.accent} />
          ) : (
            <Text style={[styles.buyLabel, !product.highlighted && styles.buyLabelSecondary]}>
              {t('premium.buy', { price: product.fallbackPrice })}
            </Text>
          )}
        </Pressable>
      )}
    </View>
  );
}

const styles = themedStyles(() => ({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 16,
    gap: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -10,
    marginBottom: -12,
  },
  pressed: {
    opacity: 0.8,
  },
  hero: {
    gap: 8,
  },
  heroBalls: {
    flexDirection: 'row',
    gap: 6,
  },
  heroSwatch: {
    width: 28,
    height: 6,
    borderRadius: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 32,
    letterSpacing: -0.6,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 21,
    color: colors.textMuted,
  },
  products: {
    gap: 12,
  },
  product: {
    padding: 16,
    gap: 14,
    borderRadius: radius.card + 4,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  productHighlighted: {
    borderColor: colors.accent,
    borderWidth: 2,
  },
  ribbon: {
    position: 'absolute',
    top: -11,
    right: 16,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  ribbonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: colors.onAccent,
  },
  productHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  productIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.field,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productIconHighlighted: {
    backgroundColor: colors.accent,
  },
  flex: {
    flex: 1,
    gap: 3,
  },
  productTitle: {
    fontFamily: fonts.display,
    fontSize: 19,
    color: colors.text,
  },
  productDescription: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 19,
    color: colors.textMuted,
  },
  buy: {
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buySecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  buyLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.onAccent,
  },
  buyLabelSecondary: {
    color: colors.accent,
  },
  ownedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 46,
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.field,
  },
  ownedLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.text,
  },
  restore: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    paddingHorizontal: 12,
  },
  restoreLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.accent,
  },
  status: {
    fontFamily: fonts.body,
    fontSize: 13,
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: -10,
  },
  simulated: {
    padding: 12,
    gap: 6,
    borderRadius: radius.field,
    backgroundColor: colors.shiny,
  },
  simulatedText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.shinyText,
  },
  simulatedLink: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.shinyText,
    textDecorationLine: 'underline',
  },
}));
