import { STORAGE_INDEXES } from "../constants";
import { getFromLocalStorage } from "../localStorage";

export const getToken = () => {
  const token = getFromLocalStorage(STORAGE_INDEXES.APP_STORAGE)[
    STORAGE_INDEXES.ACCESS_TOKEN
  ];
  return token;
};
