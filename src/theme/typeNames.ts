import { labelMap } from '@/i18n';
import { localName } from '@/i18n/names';
import { TYPE_NAMES, type TypeName } from '@/types/pokemon';

/** Nomi dei 18 tipi nella lingua in uso, da PokéAPI. */
export const TYPE_LABELS: Record<TypeName, string> = labelMap(TYPE_NAMES, (type) => localName('type', type));
