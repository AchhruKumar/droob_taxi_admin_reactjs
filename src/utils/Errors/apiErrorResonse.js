import {
  AXIOS_ERROR_CODE,
  DEFAULT_VALUE,
  RESPONSE_CODE,
} from "../constants";
import { RESPONSE_MESSAGES } from "../validationsMessages";

export const ApiErrorMessage = (error) => {
  const LOCALE = DEFAULT_VALUE.LOCALE;
  if (!error) return RESPONSE_MESSAGES[LOCALE].UNKNOWN_ERROR_MESSAGE;
  let errorMessage;
  if (error.code === AXIOS_ERROR_CODE.ERR_NETWORK) {
    return RESPONSE_MESSAGES[LOCALE].NETWORK_ERROR;
  } else if (error.code === AXIOS_ERROR_CODE.ECONNABORTED) {
    return RESPONSE_MESSAGES[LOCALE].ECONNABORTED;
  } else if (error.code === AXIOS_ERROR_CODE.ERR_BAD_REQUEST) {
    if (error.response.status === RESPONSE_CODE[401]) {
      localStorage.clear();
      return (window.location.href = "/login");
    }
    return `${error.response.data?.message}`;
  } else {
    const { response } = error;
    if (response && response.data) {
      const { data: responseData } = response;
      if (response.status === RESPONSE_CODE[400]) {
        const { message } = responseData;
        return message;
      } else if (response.status === RESPONSE_CODE[400]) {
        return RESPONSE_MESSAGES[LOCALE].NOT_FOUND_404;
      } else if (response.status === RESPONSE_CODE[401]) {
        return RESPONSE_MESSAGES[LOCALE].NOT_FOUND_401;
      } else if (response.status === RESPONSE_CODE[500]) {
        return RESPONSE_MESSAGES[LOCALE].INTERNAL_SERVER_ERROR;
      }
    } else {
      return RESPONSE_MESSAGES[LOCALE].UNKNOWN_ERROR_MESSAGE;
    }
  }
  return errorMessage;
};
