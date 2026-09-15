"use client";

import { useSyncExternalStore } from "react";
import { mockApi } from "@saasfood/shared";

export function useMockState() {
  return useSyncExternalStore(mockApi.subscribe, mockApi.getState, mockApi.getState);
}
