import secureLocalStorage from "react-secure-storage";

const secureStorage = {
  getItem: function (key) {
    return Promise.resolve(secureLocalStorage.getItem(key));
  },

  setItem: function (key, value) {
    secureLocalStorage.setItem(key, value);
    return Promise.resolve();
  },

  removeItem: function (key) {
    secureLocalStorage.removeItem(key);
    return Promise.resolve();
  },
};

export default secureStorage;
