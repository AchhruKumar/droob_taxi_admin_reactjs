import axios from "axios";
import { getToken } from "../Auth";

let controller;

export function getRequest(URL) {
  let payload = {},
    headers = {};
  return apiRequest(URL, payload, "get", headers);
}

export function postRequest(URL, payload, headers = {}) {
  return apiRequest(URL, payload, "post", headers);
}

export function putRequest(URL, payload, headers = {}) {
  return apiRequest(URL, payload, "put", headers);
}
export function patchRequest(URL, payload, headers = {}) {
  return apiRequest(URL, payload, "patch", headers);
}

export function deleteRequest(URL, payload, headers = {}) {
  return apiRequest(URL, payload, "delete", headers);
}

export function cancelRequest() {
  if (controller) {
    controller.abort();
    controller = null;
  }
}

export async function apiRequest(
  endPoint,
  data,
  method,
  headers,
  requestOptions = {}
) {
  return new Promise(async (resolve, reject) => {
    const token = getToken();
    const headers = {
      Accept: "application/json",
    };

    if (data instanceof FormData) {
      headers["Content-Type"] = "multipart/form-data";
    } else {
      headers["Content-Type"] = "application/json";
    }
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      headers["accept-language"] = `en`;
    }

    controller = new AbortController();
    const signal = controller.signal;

    axios({
      method: method,
      url: endPoint,
      headers: headers,
      data: data,
      signal: signal,
    })
      .then((result) => {
        return resolve(result);
      })
      .catch((error) => {
        if (error?.response?.status === 401) {
          console.warn("Unauthorized! Redirecting to login...");
          try {
            clearToken?.();
          } catch {}

          window.location.href = "/login";
          return;
        }

        if (axios.isCancel(error)) {
          return reject(new Error("Request canceled by user"));
        }
        return reject(error);
      });
  });
}
