"use-client";
import secureLocalStorage from "react-secure-storage";
import { defaultInitialState } from "../seeds/Authseeders";
import { STORAGE_INDEXES } from "../constants";

export function setOnLocalStorage(index, data) {
  data = JSON.stringify(data);

  if (typeof window !== "undefined") {
    return secureLocalStorage.setItem(index, data);
  }
}

export function getFromLocalStorage(index) {
  return JSON.parse(secureLocalStorage.getItem(index));
}

export function setInitialState() {
  const _initialStates = JSON.parse(
    secureLocalStorage.getItem(STORAGE_INDEXES.APP_STORAGE)
  );
  return _initialStates === null
    ? defaultInitialState(STORAGE_INDEXES.APP_STORAGE)
    : _initialStates;
}
