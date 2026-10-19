import { t } from '@/i18n';

export const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

const TIMEOUT_MS = 15_000;

/** Errore di rete o HTTP, con un messaggio nella lingua in uso pronto da mostrare. */
export class ApiError extends Error {
  /** Codice HTTP, oppure null se la richiesta non è arrivata al server. */
  readonly status: number | null;

  constructor(message: string, status: number | null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }
}

export async function fetchJson<T>(
  path: string,
  signal?: AbortSignal,
  notFoundMessage: string = t('common:errors.pokemonNotFound'),
): Promise<T> {
  // AbortSignal.timeout/any non sono garantiti su Hermes: timeout gestito a mano.
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, TIMEOUT_MS);
  const onAbort = () => controller.abort();
  signal?.addEventListener('abort', onAbort);

  let response: Response;
  try {
    response = await fetch(`${POKEAPI_BASE_URL}${path}`, { signal: controller.signal });
  } catch (error) {
    // Una cancellazione voluta da React Query va propagata così com'è.
    if (signal?.aborted) throw error;
    if (timedOut) {
      throw new ApiError(t('common:errors.timeout'), null);
    }
    throw new ApiError(t('common:errors.offline'), null);
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }

  if (!response.ok) {
    throw new ApiError(
      response.status === 404
        ? notFoundMessage
        : t('common:errors.server', { status: response.status }),
      response.status,
    );
  }

  return (await response.json()) as T;
}

/** Messaggio da mostrare all'utente per qualunque errore restituito dagli hook. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return t('common:errors.generic');
}
