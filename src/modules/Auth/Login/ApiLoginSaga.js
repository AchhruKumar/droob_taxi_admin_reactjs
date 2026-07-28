"use-client";

import { call, put } from "redux-saga/effects";
import {
  LOGOUT_SUCCESS,
  UPDATE_SUCCESS,
  VERIFY_SUCCESS,
} from "./LoginConstants";

import axios from "axios";
import { AUTH } from "../../../utils/endPoints";
import { RESPONSE_CODE, STORAGE_INDEXES } from "../../../utils/constants";
import { setOnLocalStorage } from "../../../utils/localStorage";
import actions from "../../../redux/actions";
import { postRequest } from "../../../utils/http-client/axiosClient";
import { defaultInitialState } from "../../../utils/seeds/Authseeders";
import { requestForToken } from "../../../utils/firebase";
// export function* login({ payload, navigate }) {
//   yield put({ type: actions.INIT_LOADER, payload: { loader: true } });

//   try {
//     const {
//       data: { data },
//       status,
//     } = yield call(() => axios.post(AUTH.LOGIN, payload));
//     console.log(data, "hdcdcjhdjbdfbj");
//     if (status === RESPONSE_CODE[200]) {
//       const token = data.token;
//       if (!token) throw new Error("Token missing in login response");

//       const authDetails = {
//         access_token: token,
//         user: data || {},
//       };
//       console.log(data, "chsdbskjdskdksd");

//       if (data?.resturant) {
//         navigate("/dashboard");
//       } else {
//         navigate("/restaurant-detail");
//       }
//       setOnLocalStorage(STORAGE_INDEXES.APP_STORAGE, authDetails);

//       yield put({ type: actions.LOGIN_SUCCESS, payload: authDetails });
//     }
//   } catch (error) {
//     console.error(error);
//     yield put({
//       type: actions.FAILURE,
//       payload: error.response?.data || { message: error.message },
//       index: actions.FAILURE,
//     });
//   }

//   yield put({ type: actions.INIT_LOADER, payload: { loader: false } });
// }


export function* login({ payload, navigate }) {
  yield put({ type: actions.INIT_LOADER, payload: { loader: true } });

  try {
    // ✅ Get FCM token first
    let fcmToken = null;

    try {
      fcmToken = yield call(requestForToken);
      console.log("FCM Token bgdhsfdhf:", fcmToken);
    } catch (err) {
      console.log("FCM token error:", err);
    }

    // ✅ Attach FCM token in payload
    const updatedPayload = {
      ...payload,
      fcmToken,
    };

    const {
      data: { data },
      status,
    } = yield call(() => axios.post(AUTH.LOGIN, updatedPayload));

    if (status === RESPONSE_CODE[200]) {
      const token = data.token;
      if (!token) throw new Error("Token missing in login response");

      const authDetails = {
        access_token: token,
        user: data || {},
      };

      // Navigation logic
      if (data?.resturant) {
        navigate("/dashboard");
      } else {
        navigate("/restaurant-detail");
      }

      setOnLocalStorage(STORAGE_INDEXES.APP_STORAGE, authDetails);

      yield put({ type: actions.LOGIN_SUCCESS, payload: authDetails });
    }
  } catch (error) {
    console.error(error);
    yield put({
      type: actions.FAILURE,
      payload: error.response?.data || { message: error.message },
      index: actions.FAILURE,
    });
  }

  yield put({ type: actions.INIT_LOADER, payload: { loader: false } });
}

export function* verify(token) {
  yield put({ type: actions.INIT_LOADER, payload: { loader: true } });
  const { payload } = token;
  try {
    const { data, status } = yield call(() =>
      postRequest(AUTH.VERIFY, { token: payload })
    );
    if (status === RESPONSE_CODE[200]) {
      yield put({
        type: VERIFY_SUCCESS,
        payload: data,
        index: VERIFY_SUCCESS,
      });
    }
  } catch (error) {
    yield put({
      type: actions.FAILURE,
      payload: error.response.data,
      index: actions.FAILURE,
    });
  }
}

export function* updateUserAccount(action) {
  const _data = action.payload;
  console.log(_data, "checkdssaction in updateUserAccdssdount saga");
  // const authDetails = authUserData(_data);
  setOnLocalStorage(STORAGE_INDEXES.APP_STORAGE, action.payload);
  yield put({
    type: UPDATE_SUCCESS,
    payload: _data,
  });
}

export function* logout(action) {
  const {
    payload: { callback },
  } = action;
  yield put({
    type: LOGOUT_SUCCESS,
    payload: defaultInitialState(STORAGE_INDEXES.APP_STORAGE),
  });
  callback.push("/login");
}
