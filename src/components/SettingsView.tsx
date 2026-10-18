import { Image } from 'expo-image';
import { openBrowserAsync } from 'expo-web-browser';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ARTWORK_STYLES, getArtworkUrl, type ArtworkStyle } from '@/api/pokemon';
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
        accessibilityLabel="Torna all'elenco"
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
        <Icon name="back" size={18} color={colors.text} />
      </Pressable>
      <View style={styles.titleRow}>
        <PokeBallLogo />
        <Text style={styles.title} accessibilityRole="header">
          Impostazioni
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          Artwork principale
        </Text>
        <Text style={styles.sectionHint}>
          Lo stile delle immagini nell&apos;elenco e in cima alla scheda di ogni Pokémon.
        </Text>
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

type BackupStatus = { tone: 'ok' | 'error'; text: string } | null;

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** Esporta e importa preferiti, shiny e squadre in un file JSON. */
function BackupSection() {
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
              ? 'Esportazione non riuscita.'
              : 'Non è stato possibile leggere il file.',
      });
    } finally {
      setBusy(null);
    }
  }

  const exportBackup = () =>
    run('export', async () => {
      await saveBackupFile(backupFileName(), createBackup());
      return { tone: 'ok', text: 'Backup esportato.' };
    });

  const importBackup = () =>
    run('import', async () => {
      const text = await pickBackupFile();
      if (text === null) return null;
      const restored = restoreBackup(text);
      return {
        tone: 'ok',
        text: `Ripristinati ${plural(restored.favorites, 'preferito', 'preferiti')}, ${plural(
          restored.shinyCaught,
          'shiny',
          'shiny',
        )} e ${plural(restored.teams, 'squadra', 'squadre')}.`,
      };
    });

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        Backup
      </Text>
      <Text style={styles.sectionHint}>
        Salva preferiti, shiny ottenuti e squadre in un file JSON, per ripristinarli su un altro
        dispositivo o dopo una reinstallazione. L&apos;importazione sostituisce i dati attuali.
      </Text>
      <View style={styles.buttons}>
        <BackupButton
          label="Esporta backup"
          busy={busy === 'export'}
          disabled={busy !== null}
          onPress={exportBackup}
        />
        <BackupButton
          label="Importa backup"
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
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        Crediti e copyright
      </Text>
      <View style={styles.credits}>
        <Text style={styles.creditsText}>
          Dati e immagini da{' '}
          <Text
            style={styles.link}
            accessibilityRole="link"
            onPress={() => openBrowserAsync('https://pokeapi.co')}>
            PokéAPI
          </Text>
          , progetto libero e gratuito mantenuto dalla comunità.
        </Text>
        <Text style={styles.creditsText}>
          Questa è un&apos;app non ufficiale creata da fan, senza scopo di lucro, non affiliata né
          approvata da Nintendo, Creatures Inc., GAME FREAK inc. o The Pokémon Company.
        </Text>
        <Text style={styles.creditsText}>
          Pokémon e i nomi dei personaggi sono marchi registrati di Nintendo, Creatures Inc. e
          GAME FREAK inc. © 1995–{new Date().getFullYear()} Nintendo / Creatures Inc. / GAME
          FREAK inc.
        </Text>
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
