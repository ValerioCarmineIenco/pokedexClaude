export const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

const TIMEOUT_MS = 15_000;

/** Errore di rete o HTTP, con un messaggio italiano pronto da mostrare. */
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
  notFoundMessage = 'Pokémon non trovato.',
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
      throw new ApiError('Il server non risponde. Riprova tra poco.', null);
    }
    throw new ApiError('Connessione assente. Controlla la rete e riprova.', null);
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }

  if (!response.ok) {
    throw new ApiError(
      response.status === 404
        ? notFoundMessage
        : `Errore del server (${response.status}). Riprova tra poco.`,
      response.status,
    );
  }

  return (await response.json()) as T;
}

/** Messaggio da mostrare all'utente per qualunque errore restituito dagli hook. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return 'Qualcosa è andato storto. Riprova.';
}
