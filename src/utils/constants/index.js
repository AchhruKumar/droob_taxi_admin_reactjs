"use-client";
export const RESPONSE_CODE = {
  200: 200,
  201: 201,
  400: 400,
  404: 404,
  500: 500,
  401: 401,
};
export const IMAGE_URL =
  import.meta.env.VITE_PUBLIC_IMAGE_URL || "http://localhost:3000/images";

export const AXIOS_ERROR_CODE = {
  ERR_NETWORK: "ERR_NETWORK",
  ECONNABORTED: "ECONNABORTED",
  ERR_BAD_REQUEST: "ERR_BAD_REQUEST",
  ERR_CANCELED: "ERR_CANCELED",
};

export const STORAGE_INDEXES = {
  IS_AUTHENTICATED: "isAuthenticated",
  ACCESS_TOKEN: "access_token",
  LOADER: "loader",
  EMAIL: "email",
  TEMPLATE: "templateDetails",
  PHONE: "phone",
  NAME: "name",
  AUTH: "auth",
  ERROR_MESSAGE: "errorMessage",
  USER_ID: "id",
  USER_ROLE: "role_name",
  PASSWORD: "password",
  APP_STORAGE: "app_storage",
  countryCode: "countryCode",
  APP_SETTINGS_STORAGE: "app_settings_storage",
  NAV_SETTINGS: "tg_nav_settings",
  USER_DETAILS: "userDetails",
  LOCALE: "locale",
  PROFILE_PICTURE: "profile_picture",
  SUBSCRIBED: "isSubscribed",
  USER_SECTOR: "userSector",
  USER_SUB_SECTOR: "userSubSector",
  COMPANY_NAME: "company_name",
  INVITE_CODE: "invite_code",
  PAGE_NO: "page_no",
  NUMBER_OF_ROWS: "number_of_rows",
  APP_SETTINGS: "app_settings",
  ROLE_LIST: "role_list",
  ROLE_ID: "role_id",
  SEARCH_TEXT: "search_text",
  FIRST_NAME: "firstName",
  PUBLIC_API_KEY: "public_api_key",
  COUNTRY: "country",
  STATE: "state",
  CITY: "city",
  LAST_NAME: "lastName",
  USERNAME: "userName",
  IS_ACTIVE: "userName",
  IS_VERFIED: "userVerified",
};
export const DEFAULT_VALUE = {
  LOCALE: "en",
  LOGO: "/assets/images/app/logo_header.png",
  NA: "NA",
  COUNTRY_ISO: "us",
  COUNTRY_DIAL_CODE: "+1",
  FLAG_CDN_W20: "https://flagcdn.com/w20/",
  FLAG_CDN_W40: "https://flagcdn.com/w40/",
};

export const convertBytes = (bytes) => {
  if (bytes < 1024) {
    return `${bytes} B`; // Bytes if less than 1 KB
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`; // Convert to KB if less than 1 MB
  } else if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`; // Convert to MB if less than 1 GB
  } else {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`; // Convert to GB if more than 1 GB
  }
};
