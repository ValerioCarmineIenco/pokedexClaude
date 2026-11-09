import type { ReactNode } from 'react';
import { View } from 'react-native';

import { colors } from '@/theme/colors';
import { themedStyles } from '@/theme/styles';

import { AppText } from './AppText';
import { IconButton } from './IconButton';

type Props = {
  /** Titolo in Anton maiuscolo; `\n` lo va a capo («POKÉ\nDEX»). */
  title: string;
  /** Righe piccole allineate in basso a destra («1025 POKéMON»). */
  meta?: string[];
  /** Al posto delle righe `meta`: un'azione in alto a destra («+ Nuova»). */
  action?: ReactNode;
  /** Mostra il pulsante indietro sopra il titolo. */
  onBack?: () => void;
  backLabel?: string;
};

/** Intestazione grande delle schermate: titolo poster, dati o azione a destra. */
export function ScreenHeader({ title, meta, action, onBack, backLabel }: Props) {
  return (
    <View style={styles.header}>
      {onBack && (
        <View style={styles.back}>
          <IconButton icon="back" accessibilityLabel={backLabel ?? ''} onPress={onBack} />
        </View>
      )}
      <View style={styles.row}>
        <AppText variant="hero" accessibilityRole="header" style={styles.title}>
          {title}
        </AppText>
        {action ? (
          <View style={styles.action}>{action}</View>
        ) : meta && meta.length > 0 ? (
          <View style={styles.meta}>
            {meta.map((line) => (
              <AppText key={line} variant="label" color={colors.textMuted} style={styles.metaLine}>
                {line}
              </AppText>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = themedStyles(() => ({
  header: { gap: 16 },
  back: { alignSelf: 'flex-start' },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 16,
  },
  title: { flex: 1 },
  action: { alignSelf: 'flex-start', paddingTop: 10, flexShrink: 0 },
  meta: { alignItems: 'flex-end', paddingBottom: 10, gap: 2, flexShrink: 0 },
  metaLine: { textAlign: 'right', fontSize: 13 },
}));
