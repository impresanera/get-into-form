type NotNull<T> = T extends null ? never : T;
export type Result<T, E = any> =
  | {
      error: E; //NotNull<E>;
      ok: false;
    }
  | {
      value: T;
      ok: true;
    };
