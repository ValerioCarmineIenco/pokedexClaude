import * as DocumentPicker from 'expo-document-picker';

/** Sul web il backup si scarica come file. */
export async function saveBackupFile(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  // Lascia al browser il tempo di avviare il download prima di liberare il blob.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Fa scegliere un file di backup e ne restituisce il testo, o `null` se si annulla. */
export async function pickBackupFile(): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({ type: ['application/json', '.json'] });
  if (result.canceled) return null;
  const asset = result.assets[0];
  return asset.file ? asset.file.text() : (await fetch(asset.uri)).text();
}
