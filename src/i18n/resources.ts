// Traduzioni dell'interfaccia: un file per lingua e per area dell'app (namespace).

import en_common from './locales/en/common.json';
import en_pokedex from './locales/en/pokedex.json';
import en_pokemon from './locales/en/pokemon.json';
import en_evolution from './locales/en/evolution.json';
import en_items from './locales/en/items.json';
import en_abilities from './locales/en/abilities.json';
import en_natures from './locales/en/natures.json';
import en_moves from './locales/en/moves.json';
import en_types from './locales/en/types.json';
import en_locations from './locales/en/locations.json';
import en_teams from './locales/en/teams.json';
import en_compare from './locales/en/compare.json';
import en_settings from './locales/en/settings.json';
import it_common from './locales/it/common.json';
import it_pokedex from './locales/it/pokedex.json';
import it_pokemon from './locales/it/pokemon.json';
import it_evolution from './locales/it/evolution.json';
import it_items from './locales/it/items.json';
import it_abilities from './locales/it/abilities.json';
import it_natures from './locales/it/natures.json';
import it_moves from './locales/it/moves.json';
import it_types from './locales/it/types.json';
import it_locations from './locales/it/locations.json';
import it_teams from './locales/it/teams.json';
import it_compare from './locales/it/compare.json';
import it_settings from './locales/it/settings.json';
import fr_common from './locales/fr/common.json';
import fr_pokedex from './locales/fr/pokedex.json';
import fr_pokemon from './locales/fr/pokemon.json';
import fr_evolution from './locales/fr/evolution.json';
import fr_items from './locales/fr/items.json';
import fr_abilities from './locales/fr/abilities.json';
import fr_natures from './locales/fr/natures.json';
import fr_moves from './locales/fr/moves.json';
import fr_types from './locales/fr/types.json';
import fr_locations from './locales/fr/locations.json';
import fr_teams from './locales/fr/teams.json';
import fr_compare from './locales/fr/compare.json';
import fr_settings from './locales/fr/settings.json';
import de_common from './locales/de/common.json';
import de_pokedex from './locales/de/pokedex.json';
import de_pokemon from './locales/de/pokemon.json';
import de_evolution from './locales/de/evolution.json';
import de_items from './locales/de/items.json';
import de_abilities from './locales/de/abilities.json';
import de_natures from './locales/de/natures.json';
import de_moves from './locales/de/moves.json';
import de_types from './locales/de/types.json';
import de_locations from './locales/de/locations.json';
import de_teams from './locales/de/teams.json';
import de_compare from './locales/de/compare.json';
import de_settings from './locales/de/settings.json';
import es_common from './locales/es/common.json';
import es_pokedex from './locales/es/pokedex.json';
import es_pokemon from './locales/es/pokemon.json';
import es_evolution from './locales/es/evolution.json';
import es_items from './locales/es/items.json';
import es_abilities from './locales/es/abilities.json';
import es_natures from './locales/es/natures.json';
import es_moves from './locales/es/moves.json';
import es_types from './locales/es/types.json';
import es_locations from './locales/es/locations.json';
import es_teams from './locales/es/teams.json';
import es_compare from './locales/es/compare.json';
import es_settings from './locales/es/settings.json';
import ja_common from './locales/ja/common.json';
import ja_pokedex from './locales/ja/pokedex.json';
import ja_pokemon from './locales/ja/pokemon.json';
import ja_evolution from './locales/ja/evolution.json';
import ja_items from './locales/ja/items.json';
import ja_abilities from './locales/ja/abilities.json';
import ja_natures from './locales/ja/natures.json';
import ja_moves from './locales/ja/moves.json';
import ja_types from './locales/ja/types.json';
import ja_locations from './locales/ja/locations.json';
import ja_teams from './locales/ja/teams.json';
import ja_compare from './locales/ja/compare.json';
import ja_settings from './locales/ja/settings.json';

export const resources = {
  en: {
    common: en_common,
    pokedex: en_pokedex,
    pokemon: en_pokemon,
    evolution: en_evolution,
    items: en_items,
    abilities: en_abilities,
    natures: en_natures,
    moves: en_moves,
    types: en_types,
    locations: en_locations,
    teams: en_teams,
    compare: en_compare,
    settings: en_settings,
  },
  it: {
    common: it_common,
    pokedex: it_pokedex,
    pokemon: it_pokemon,
    evolution: it_evolution,
    items: it_items,
    abilities: it_abilities,
    natures: it_natures,
    moves: it_moves,
    types: it_types,
    locations: it_locations,
    teams: it_teams,
    compare: it_compare,
    settings: it_settings,
  },
  fr: {
    common: fr_common,
    pokedex: fr_pokedex,
    pokemon: fr_pokemon,
    evolution: fr_evolution,
    items: fr_items,
    abilities: fr_abilities,
    natures: fr_natures,
    moves: fr_moves,
    types: fr_types,
    locations: fr_locations,
    teams: fr_teams,
    compare: fr_compare,
    settings: fr_settings,
  },
  de: {
    common: de_common,
    pokedex: de_pokedex,
    pokemon: de_pokemon,
    evolution: de_evolution,
    items: de_items,
    abilities: de_abilities,
    natures: de_natures,
    moves: de_moves,
    types: de_types,
    locations: de_locations,
    teams: de_teams,
    compare: de_compare,
    settings: de_settings,
  },
  es: {
    common: es_common,
    pokedex: es_pokedex,
    pokemon: es_pokemon,
    evolution: es_evolution,
    items: es_items,
    abilities: es_abilities,
    natures: es_natures,
    moves: es_moves,
    types: es_types,
    locations: es_locations,
    teams: es_teams,
    compare: es_compare,
    settings: es_settings,
  },
  ja: {
    common: ja_common,
    pokedex: ja_pokedex,
    pokemon: ja_pokemon,
    evolution: ja_evolution,
    items: ja_items,
    abilities: ja_abilities,
    natures: ja_natures,
    moves: ja_moves,
    types: ja_types,
    locations: ja_locations,
    teams: ja_teams,
    compare: ja_compare,
    settings: ja_settings,
  },
} as const;

export const NAMESPACES = Object.keys(resources.en) as (keyof typeof resources.en)[];
