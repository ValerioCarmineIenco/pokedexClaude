import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/** Salva il backup nella cache e apre il foglio di condivisione per spostarlo dove si vuole. */
export async function saveBackupFile(name: string, text: string) {
  const file = new File(Paths.cache, name);
  file.create({ overwrite: true });
  file.write(text);
  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    UTI: 'public.json',
    dialogTitle: 'Esporta backup',
  });
}

/** Fa scegliere un file di backup e ne restituisce il testo, o `null` se si annulla. */
export async function pickBackupFile(): Promise<string | null> {
  // Qualsiasi tipo: su Android un .json scaricato spesso non ha il MIME giusto; il contenuto
  // viene comunque controllato da `parseBackup`.
  const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
  if (result.canceled) return null;
  return new File(result.assets[0].uri).text();
}
