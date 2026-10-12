// Dati finti per la lista abilità, finché il layer dati delle abilità non arriva su main.
// Poi si sostituisce `useAbilitiesMock` con `useAbilities` e questo file si elimina.

import { useMemo } from 'react';

import type { AbilityListEntry } from '@/components/abilities/AbilityCard';
import { normalizeSearch } from '@/utils/search';

export const ABILITIES_MOCK: AbilityListEntry[] = [
  { id: 3, name: 'Acceleratore', description: 'La Velocità aumenta a ogni turno.' },
  { id: 8, name: 'Sabbiavelo', description: 'Aumenta l\'elusione durante le tempeste di sabbia.' },
  { id: 9, name: 'Statico', description: 'Può paralizzare chi lo attacca con una mossa di contatto.' },
  { id: 10, name: 'Assorbivolt', description: 'Recupera PS se colpito da mosse di tipo Elettro.' },
  { id: 11, name: 'Assorbacqua', description: 'Recupera PS se colpito da mosse di tipo Acqua.' },
  { id: 18, name: 'Fuocardore', description: 'Potenzia le mosse Fuoco se colpito da una mossa Fuoco.' },
  { id: 19, name: 'Polvoscudo', description: 'Blocca gli effetti secondari delle mosse subite.' },
  { id: 22, name: 'Prepotenza', description: 'Entrando in campo riduce l\'Attacco degli avversari.' },
  { id: 24, name: 'Cartavetro', description: 'Ferisce chi lo attacca con una mossa di contatto.' },
  { id: 25, name: 'Magidifesa', description: 'Viene colpito solo dalle mosse superefficaci.' },
  { id: 26, name: 'Levitazione', description: 'Fluttua in aria ed è immune alle mosse di tipo Terra.' },
  { id: 28, name: 'Sincronismo', description: 'Trasmette all\'avversario scottatura, veleno o paralisi.' },
  { id: 30, name: 'Alternacura', description: 'Guarisce dai problemi di stato tornando nella squadra.' },
  { id: 32, name: 'Leggiadro', description: 'Aumenta la probabilità degli effetti secondari.' },
  { id: 33, name: 'Nuotovelox', description: 'Raddoppia la Velocità quando piove.' },
  { id: 34, name: 'Clorofilla', description: 'Raddoppia la Velocità quando c\'è il sole.' },
  { id: 37, name: 'Macroforza', description: 'Raddoppia l\'Attacco.' },
  { id: 39, name: 'Forza Interiore', description: 'Non tentenna e non si fa intimidire.' },
  { id: 46, name: 'Pressione', description: 'Le mosse avversarie consumano più PP.' },
  { id: 47, name: 'Grassospesso', description: 'Dimezza i danni delle mosse Fuoco e Ghiaccio.' },
  { id: 50, name: 'Fugafacile', description: 'Riesce sempre a fuggire dai Pokémon selvatici.' },
  { id: 51, name: 'Sguardofermo', description: 'La precisione non può essere ridotta.' },
  { id: 56, name: 'Incantevole', description: 'Può far innamorare chi lo attacca con una mossa di contatto.' },
  { id: 61, name: 'Muta', description: 'Può guarire dai problemi di stato a fine turno.' },
  { id: 62, name: 'Dentistretti', description: 'Con un problema di stato aumenta l\'Attacco.' },
  { id: 65, name: 'Erbaiuto', description: 'Potenzia le mosse Erba quando ha pochi PS.' },
  { id: 66, name: 'Aiutofuoco', description: 'Potenzia le mosse Fuoco quando ha pochi PS.' },
  { id: 67, name: 'Acquaiuto', description: 'Potenzia le mosse Acqua quando ha pochi PS.' },
  { id: 68, name: 'Aiutinsetto', description: 'Potenzia le mosse Coleottero quando ha pochi PS.' },
  { id: 70, name: 'Siccità', description: 'Entrando in campo fa splendere il sole.' },
].sort((a, b) => a.name.localeCompare(b.name, 'it'));

/** Stessa forma di ritorno che avrà `useAbilities(search)`, con un'unica pagina già pronta. */
export function useAbilitiesMock(search = '') {
  const needle = normalizeSearch(search);
  const abilities = useMemo(
    () =>
      needle
        ? ABILITIES_MOCK.filter((ability) => normalizeSearch(ability.name).includes(needle))
        : ABILITIES_MOCK,
    [needle],
  );
  return {
    abilities,
    total: abilities.length,
    isLoading: false,
    errorMessage: null as string | null,
    hasNextPage: false,
    isFetchingNextPage: false,
    isRefreshing: false,
    fetchNextPage: () => {},
    refetch: () => {},
  };
}
