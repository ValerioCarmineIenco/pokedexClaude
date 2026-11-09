import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Linking, Platform, Pressable, Text, View } from 'react-native';

import { colors, radius } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { themedStyles } from '@/theme/styles';

import { showAdsPrivacyOptions, useAdsState } from './consent';

/**
 * Sezione delle Impostazioni per rivedere il consenso alla pubblicità: il modulo
 * di Google dove il GDPR lo richiede, e su iOS il permesso di tracciamento (si
 * cambia solo dalle Impostazioni di sistema). Dove non serve non compare.
 */
export function AdsPrivacySection() {
  const { t } = useTranslation('settings');
  const { adsReady, privacyOptionsRequired } = useAdsState();
  const [busy, setBusy] = useState(false);
  const showTracking = Platform.OS === 'ios' && (adsReady || privacyOptionsRequired);
  if (!privacyOptionsRequired && !showTracking) return null;

  async function openConsentForm() {
    setBusy(true);
    try {
      await showAdsPrivacyOptions();
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        {t('adsPrivacy.title')}
      </Text>
      <Text style={styles.sectionHint}>{t('adsPrivacy.hint')}</Text>
      <View style={styles.buttons}>
        {privacyOptionsRequired ? (
          <PrivacyButton
            label={t('adsPrivacy.manageConsent')}
            busy={busy}
            disabled={busy}
            onPress={openConsentForm}
          />
        ) : null}
        {showTracking ? (
          <PrivacyButton
            label={t('adsPrivacy.tracking')}
            busy={false}
            disabled={false}
            onPress={() => void Linking.openSettings()}
          />
        ) : null}
      </View>
      {showTracking ? <Text style={styles.note}>{t('adsPrivacy.trackingHint')}</Text> : null}
    </View>
  );
}

function PrivacyButton({
  label,
  busy,
  disabled,
  onPress,
}: {
  label: string;
  busy: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled, busy }}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      {busy ? <ActivityIndicator size="small" color={colors.accent} /> : null}
      <Text style={styles.buttonLabel}>{label}</Text>
    </Pressable>
  );
}

// Stessi stili delle altre sezioni di `SettingsView`.
const styles = themedStyles(() => ({
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.text,
  },
  sectionHint: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    marginBottom: 4,
  },
  buttons: {
    gap: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
    paddingHorizontal: 12,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.8,
  },
  buttonLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.text,
  },
  note: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSubtle,
  },
}));
