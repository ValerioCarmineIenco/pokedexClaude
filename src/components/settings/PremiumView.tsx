import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { isUnlocked, PRODUCTS, type Product, type ProductId } from '@/purchases/catalog';
import {
  purchase,
  purchasesMode,
  PURCHASES_SIMULATED,
  resetSimulatedPurchases,
  restore,
  unlockWebPreview,
  useEntitlements,
  usePrices,
  usePurchases,
  webPreviewAvailable,
} from '@/purchases/store';
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
  device_theme: 'device',
};

/**
 * Negozio degli acquisti in-app: Pokédex Pro, Rimuovi pubblicità, Pacchetto stile e tema
 * Dispositivo. Sul web non si compra: al posto dei pulsanti c'è lo sblocco dell'anteprima.
 */
export function PremiumView({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation('settings');
  const insets = useSafeAreaInsets();
  const { owned } = usePurchases();
  const { entitlements } = useEntitlements();
  const prices = usePrices();
  const [busy, setBusy] = useState<ProductId | 'restore' | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const onWeb = purchasesMode === 'webPreview';

  async function buy(id: ProductId) {
    setBusy(id);
    setStatus(null);
    try {
      await purchase(id);
    } catch {
      setStatus(t('premium.failed'));
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
    } catch {
      setStatus(t('premium.restoreFailed'));
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
            price={prices[product.id] ?? product.fallbackPrice}
            // Chi ha Pro ha già anche quello che sbloccano Rimuovi pubblicità e Pacchetto stile.
            owned={isUnlocked(product, entitlements)}
            purchasable={!onWeb}
            busy={busy === product.id}
            disabled={busy !== null}
            onBuy={() => buy(product.id)}
          />
        ))}
      </View>

      {onWeb ? (
        <WebPreviewPanel unlocked={owned.length > 0} />
      ) : (
        <>
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
        </>
      )}

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
  price,
  owned,
  purchasable,
  busy,
  disabled,
  onBuy,
}: {
  product: Product;
  price: string;
  owned: boolean;
  purchasable: boolean;
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
      ) : !purchasable ? (
        <View style={styles.ownedRow}>
          <Icon name="lock" size={16} color={colors.textMuted} />
          <Text style={styles.lockedLabel}>{price}</Text>
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
              {t('premium.buy', { price })}
            </Text>
          )}
        </Pressable>
      )}
    </View>
  );
}

/**
 * Solo web: gli acquisti non ci sono, ma con la password dell'anteprima si sblocca tutto in
 * questo browser (e si può ribloccare).
 */
function WebPreviewPanel({ unlocked }: { unlocked: boolean }) {
  const { t } = useTranslation('settings');
  const [password, setPassword] = useState('');
  const [checking, setChecking] = useState(false);
  const [wrong, setWrong] = useState(false);

  async function unlock() {
    setChecking(true);
    try {
      const ok = await unlockWebPreview(password);
      setWrong(!ok);
      if (ok) setPassword('');
    } finally {
      setChecking(false);
    }
  }

  return (
    <View style={styles.webPanel}>
      <Text style={styles.webNote}>{t('premium.web.note')}</Text>
      {unlocked ? (
        <View style={styles.webUnlocked}>
          <Text style={styles.webText} accessibilityLiveRegion="polite">
            {t('premium.web.unlocked')}
          </Text>
          <Pressable onPress={resetSimulatedPurchases} accessibilityRole="button" hitSlop={6}>
            <Text style={styles.webLink}>{t('premium.web.lock')}</Text>
          </Pressable>
        </View>
      ) : webPreviewAvailable ? (
        <View style={styles.webForm}>
          <View style={styles.webTitleRow}>
            <Icon name="key" size={16} color={colors.accent} />
            <Text style={styles.webTitle}>{t('premium.web.title')}</Text>
          </View>
          <Text style={styles.webText}>{t('premium.web.hint')}</Text>
          <View style={styles.webInputRow}>
            <TextInput
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                setWrong(false);
              }}
              onSubmitEditing={unlock}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              placeholder={t('premium.web.password')}
              placeholderTextColor={colors.textSubtle}
              accessibilityLabel={t('premium.web.password')}
              style={styles.webInput}
            />
            <Pressable
              onPress={unlock}
              disabled={checking || password.length === 0}
              accessibilityRole="button"
              accessibilityState={{ disabled: checking || password.length === 0, busy: checking }}
              style={({ pressed }) => [styles.webButton, pressed && styles.pressed]}>
              {checking ? (
                <ActivityIndicator size="small" color={colors.onAccent} />
              ) : (
                <Text style={styles.buyLabel}>{t('premium.web.unlock')}</Text>
              )}
            </Pressable>
          </View>
          {wrong ? (
            <Text style={styles.webError} accessibilityLiveRegion="polite">
              {t('premium.web.wrong')}
            </Text>
          ) : null}
        </View>
      ) : null}
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
  lockedLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.textMuted,
  },
  webPanel: {
    gap: 12,
  },
  webNote: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    color: colors.textMuted,
  },
  webForm: {
    padding: 16,
    gap: 10,
    borderRadius: radius.card + 4,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  webTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  webTitle: {
    fontFamily: fonts.display,
    fontSize: 17,
    color: colors.text,
  },
  webText: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 19,
    color: colors.textMuted,
  },
  webInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  webInput: {
    flex: 1,
    minHeight: 46,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.background,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.text,
  },
  webButton: {
    minHeight: 46,
    minWidth: 96,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webError: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.accent,
  },
  webUnlocked: {
    padding: 12,
    gap: 6,
    borderRadius: radius.field,
    backgroundColor: colors.field,
    alignItems: 'center',
  },
  webLink: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.accent,
  },
}));
