import { Image } from 'expo-image';
import { openBrowserAsync } from 'expo-web-browser';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ARTWORK_STYLES, getArtworkUrl, type ArtworkStyle } from '@/api/pokemon';
import { getDeviceLanguage, LANGUAGES, useLanguagePreference, type LanguagePreference } from '@/i18n';
import { colors, radius } from '@/theme/colors';
import { backupFileName, BackupError, createBackup, restoreBackup } from '@/utils/backup';
import { pickBackupFile, saveBackupFile } from '@/utils/backupFile';
import { fonts } from '@/theme/fonts';

import { Icon } from './Icon';
import { PokeBallLogo } from './PokeBallLogo';

/** Pokémon usato per l'anteprima di ogni stile. */
const PREVIEW_ID = 25;

type Props = {
  artworkStyle: ArtworkStyle;
  onArtworkStyleChange: (style: ArtworkStyle) => void;
  onBack: () => void;
};

export function SettingsView({ artworkStyle, onArtworkStyleChange, onBack }: Props) {
  const { t } = useTranslation('settings');
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 },
      ]}>
      <Pressable
        onPress={onBack}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={t('back')}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
        <Icon name="back" size={18} color={colors.text} />
      </Pressable>
      <View style={styles.titleRow}>
        <PokeBallLogo />
        <Text style={styles.title} accessibilityRole="header">
          {t('title')}
        </Text>
      </View>

      <LanguageSection />

      <View style={styles.section}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          {t('artwork.title')}
        </Text>
        <Text style={styles.sectionHint}>{t('artwork.hint')}</Text>
        <View style={styles.options} accessibilityRole="radiogroup">
          {ARTWORK_STYLES.map((style) => {
            const selected = style.id === artworkStyle;
            return (
              <Pressable
                key={style.id}
                onPress={() => onArtworkStyleChange(style.id)}
                accessibilityRole="radio"
                accessibilityLabel={`${style.label}. ${style.description}`}
                accessibilityState={{ selected }}
                style={({ pressed }) => [
                  styles.option,
                  selected && styles.optionSelected,
                  pressed && styles.pressed,
                ]}>
                <View style={styles.preview}>
                  <Image
                    source={getArtworkUrl(PREVIEW_ID, style.id)}
                    style={styles.previewImage}
                    contentFit="contain"
                    transition={150}
                  />
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionLabel}>{style.label}</Text>
                  <Text style={styles.optionDescription}>{style.description}</Text>
                </View>
                {selected ? (
                  <Icon name="check" size={22} color={colors.accent} />
                ) : (
                  <View style={styles.radio} />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      <BackupSection />
      <CreditsSection />
    </ScrollView>
  );
}

/** Lingua dell'interfaccia e dei dati di PokéAPI; «Dispositivo» segue le impostazioni del telefono. */
function LanguageSection() {
  const { t } = useTranslation('settings');
  const [preference, setPreference] = useLanguagePreference();
  const device = LANGUAGES.find((language) => language.code === getDeviceLanguage())!;
  const options: { value: LanguagePreference; label: string; description?: string }[] = [
    { value: 'system', label: t('language.system'), description: t('language.systemHint', { language: device.nativeName }) },
    ...LANGUAGES.map((language) => ({
      value: language.code,
      label: language.nativeName,
      // Il nome della lingua nella lingua in uso, se diverso da quello nativo.
      description: t(`language.names.${language.code}`) === language.nativeName ? undefined : t(`language.names.${language.code}`),
    })),
  ];
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        {t('language.title')}
      </Text>
      <Text style={styles.sectionHint}>{t('language.hint')}</Text>
      <View style={styles.options} accessibilityRole="radiogroup">
        {options.map((option) => {
          const selected = option.value === preference;
          return (
            <Pressable
              key={option.value}
              onPress={() => setPreference(option.value)}
              accessibilityRole="radio"
              accessibilityLabel={option.description ? `${option.label}. ${option.description}` : option.label}
              accessibilityState={{ selected }}
              style={({ pressed }) => [
                styles.option,
                styles.languageOption,
                selected && styles.optionSelected,
                pressed && styles.pressed,
              ]}>
              <View style={styles.optionText}>
                <Text style={styles.optionLabel}>{option.label}</Text>
                {option.description ? <Text style={styles.optionDescription}>{option.description}</Text> : null}
              </View>
              {selected ? (
                <Icon name="check" size={22} color={colors.accent} />
              ) : (
                <View style={styles.radio} />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

type BackupStatus = { tone: 'ok' | 'error'; text: string } | null;

/** Esporta e importa preferiti, shiny e squadre in un file JSON. */
function BackupSection() {
  const { t } = useTranslation('settings');
  const [busy, setBusy] = useState<'export' | 'import' | null>(null);
  const [status, setStatus] = useState<BackupStatus>(null);

  async function run(kind: 'export' | 'import', action: () => Promise<BackupStatus>) {
    setBusy(kind);
    setStatus(null);
    try {
      setStatus(await action());
    } catch (error) {
      setStatus({
        tone: 'error',
        text:
          error instanceof BackupError
            ? error.message
            : kind === 'export'
              ? t('backup.exportFailed')
              : t('backup.readFailed'),
      });
    } finally {
      setBusy(null);
    }
  }

  const exportBackup = () =>
    run('export', async () => {
      await saveBackupFile(backupFileName(), createBackup());
      return { tone: 'ok', text: t('backup.exported') };
    });

  const importBackup = () =>
    run('import', async () => {
      const text = await pickBackupFile();
      if (text === null) return null;
      const restored = restoreBackup(text);
      return {
        tone: 'ok',
        text: t('backup.restored', {
          favorites: t('backup.favorites', { count: restored.favorites }),
          shiny: t('backup.shiny', { count: restored.shinyCaught }),
          teams: t('backup.teams', { count: restored.teams }),
        }),
      };
    });

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        {t('backup.title')}
      </Text>
      <Text style={styles.sectionHint}>{t('backup.hint')}</Text>
      <View style={styles.buttons}>
        <BackupButton
          label={t('backup.export')}
          busy={busy === 'export'}
          disabled={busy !== null}
          onPress={exportBackup}
        />
        <BackupButton
          label={t('backup.import')}
          busy={busy === 'import'}
          disabled={busy !== null}
          onPress={importBackup}
        />
      </View>
      {status ? (
        <Text
          accessibilityLiveRegion="polite"
          style={[styles.status, status.tone === 'error' && styles.statusError]}>
          {status.text}
        </Text>
      ) : null}
    </View>
  );
}

function BackupButton({
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
      style={({ pressed }) => [
        styles.button,
        disabled && !busy && styles.buttonDisabled,
        pressed && styles.pressed,
      ]}>
      {busy ? <ActivityIndicator size="small" color={colors.accent} /> : null}
      <Text style={styles.buttonLabel}>{label}</Text>
    </Pressable>
  );
}

/** Fonti dei dati e avviso di copyright. */
function CreditsSection() {
  const { t } = useTranslation('settings');
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        {t('credits.title')}
      </Text>
      <View style={styles.credits}>
        <Text style={styles.creditsText}>
          <Trans
            t={t}
            i18nKey="credits.data"
            components={{
              link: (
                <Text
                  style={styles.link}
                  accessibilityRole="link"
                  onPress={() => openBrowserAsync('https://pokeapi.co')}
                />
              ),
            }}
          />
        </Text>
        <Text style={styles.creditsText}>{t('credits.unofficial')}</Text>
        <Text style={styles.creditsText}>{t('credits.trademarks', { year: new Date().getFullYear() })}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 16,
    gap: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -10,
    marginBottom: -16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 40,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 30,
    letterSpacing: -0.6,
    color: colors.text,
  },
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
  options: {
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    paddingRight: 14,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  languageOption: {
    minHeight: 56,
    paddingLeft: 14,
  },
  optionSelected: {
    borderColor: colors.accent,
  },
  pressed: {
    opacity: 0.8,
  },
  preview: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.factBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: 48,
    height: 48,
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.text,
  },
  optionDescription: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  buttons: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
    paddingHorizontal: 12,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.text,
  },
  status: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.statUp,
  },
  statusError: {
    color: colors.statDown,
  },
  credits: {
    gap: 10,
    padding: 14,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
  },
  creditsText: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
  link: {
    fontFamily: fonts.bodyBold,
    color: colors.accent,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.line,
    marginHorizontal: 1,
  },
});
