export const BASEURL = import.meta.env.VITE_API_URL;
export const CONTENT = {
  UPDATE_CONTENT: `${BASEURL}/content/update-web-content`,
  GET_CONTENT: `${BASEURL}/content/get-web-content`,
};

export const AUTH = {
  LOGIN: `${BASEURL}/auth/login/restaurant-panel`,
  GETUSERDETAILS: `${BASEURL}/user/me`,
  SIGNUP: `${BASEURL}/user/add-resturant-owner`,
  VERIFY: `${BASEURL}/user/verify-email`,
  RESEND_OTP: `${BASEURL}/auth/resend-otp/sp/email`,
  SEND_OTP: `${BASEURL}/auth/send-otp/sp/email`,
  FORGET_PASSSWORD: `${BASEURL}/auth/forget-password`,
  OTP_VERIFIED: `${BASEURL}/auth/verify-otp`,
  UPDATE_PROFILE: `${BASEURL}/restaurant/edit-restaurant-profile`,
  RESET_PASSWORD: `${BASEURL}/auth/reset-password`,
  DELETE: `${BASEURL}/auth/delete`,
  DISABLE_MFA: `${BASEURL}/auth/disable-mfa`,
  ENABLE_MFA: `${BASEURL}/auth/enable-mfa`,
  LOGIN_MFA: `${BASEURL}/auth/sp/verify-mfa`,
  SOCIAL_LOGIN: `${BASEURL}/auth/social`,
  SESSIONS: `${BASEURL}/auth/sessions`,
  RESTURANT_DETAILS: `${BASEURL}/user/add-resturant-details`,
};

export const UPLOAD_FILE = {
  UPLOAD: `${BASEURL}/common/upload`,
};

export const DASHBOARD = {
  GET: `${BASEURL}/restaurant/get-dashboard-data`,
  GET_APP_DETAIL: `${BASEURL}/user/me`,
  GET_APP_NOTIFICATIONS: `${BASEURL}/restaurant/notifications`,
  GET_APP_READ_NOTIFICATIONS: `${BASEURL}/marketing/markNotificationAsRead/`,
};

export const MENU = {
  ADD: `${BASEURL}/restaurant/create-menu`,
  DELETE: `${BASEURL}/restaurant/menu`,
  AVAILABLE: `${BASEURL}/restaurant/set-availability`,
  UPDATE: `${BASEURL}/restaurant/edit-menu`,
  TRANSLATE: `${BASEURL}/common/translate`,
  LIST: `${BASEURL}/restaurant/get-own-menu`,
  GET_BY_ID: `${BASEURL}/restaurant/get-menu`,
  CATEGORY: `${BASEURL}/restaurant/category`,
  SUB_CATEGORY: `${BASEURL}/restaurant/sub-category`,
  UPDATE_RESTURENT_STATUS: `${BASEURL}/restaurant/update-availability`,
};

export const ORDERS = {
  ALL_LIST: `${BASEURL}/restaurant/get-all-orders-restaurant`,
  UPDATE_STATUS: `${BASEURL}/restaurant/update-order-status`,
  DETAILS: `${BASEURL}/restaurant/get-order-details`,
};

export const WALLET = {
  DATA: `${BASEURL}/restaurant/get-wallet-data`,
  BANK_DETAILS: `${BASEURL}/restaurant/get-all-bank`,
  BANK_DETAILS_BY_ID: `${BASEURL}/restaurant/get-bank-details`,
  ADD_BANK: `${BASEURL}/restaurant/add-bank-details`,
  EDIT_BANK: `${BASEURL}/restaurant/edit-bank-details`,
  WITHDRAW: `${BASEURL}/restaurant/request-withdraw`,
  DELETE: `${BASEURL}/restaurant/delete-bank-details`,
  PROMOTIONS: `${BASEURL}/restaurant/get-all-promotion-type`,
  CUPPONS: `${BASEURL}/restaurant/get-all-cupons`,
  UPDATE_CUPON: `${BASEURL}/restaurant/update-cupon`,
  CREATE_CUPON: `${BASEURL}/restaurant/create-cupons`,
  CUPON_BY_ID: `${BASEURL}/restaurant/get-cupon`,
  DELETE: `${BASEURL}/restaurant/delete-coupon`,
};

export const ANLYTICS = {
  EARNING: `${BASEURL}/restaurant/get-resturant-earnings`,
  COMMISSION: `${BASEURL}/restaurant/get-resturant-comminsion`,
  ORDER_SUMARY: `${BASEURL}/restaurant/get-resturant-order-summary`,
  TOP_ITEMS: `${BASEURL}/restaurant/get-resturant-top-items`,
  CUSTOMER_SEGMENTS: `${BASEURL}/restaurant/get-resturant-customer-segments`,
  SALES_BY_CATEGORY: `${BASEURL}/restaurant/get-resturant-sales-category`,
  REVIEWS: `${BASEURL}/restaurant/get-resturant-reviews`,
};

export const ATTRIBUTE = {
  ATTRIBUTES: `${BASEURL}/restaurant/attribute`,
  FETCH_ATTRIBUTES: `${BASEURL}/restaurant/getAllAttribute`,
};
