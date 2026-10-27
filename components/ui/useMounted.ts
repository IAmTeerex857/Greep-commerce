"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** True only on the client after hydration. For libraries that can't render on the server. */
export function useMounted() {
  return useSyncExternalStore(noop, () => true, () => false);
}
