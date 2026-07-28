import {
  login,
  logout,
  updateUserAccount,
} from "@/modules/Auth/Login/ApiLoginSaga";
import { LOGIN, LOGOUT, UPDATE } from "@/modules/Auth/Login/LoginConstants";
import { all, takeLatest } from "redux-saga/effects";

export default function* rootSaga() {
  yield all([takeLatest(LOGIN, login)]);
  yield all([takeLatest(LOGOUT, logout)]);
  yield all([takeLatest(UPDATE, updateUserAccount)]);
}
