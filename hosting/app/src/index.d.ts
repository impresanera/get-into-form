type NotNull<T> = T extends null ? never : T;
export type Result<T, E = unknown> =
  | {
      ok: T;
      error?: undefined;
    }
  | {
      ok?: undefined;
      error: E; //NotNull<E>;
    };
