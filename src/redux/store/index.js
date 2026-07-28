import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import rootReducer from "../reducers";
import RootSaga from "../rootSaga";

function Store(preloadedState) {
  const sagaMiddleware = createSagaMiddleware();
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(sagaMiddleware),
    preloadedState,
  });
  sagaMiddleware.run(RootSaga);

  return store;
}

export default Store;

// store.ts
// store.ts
// import { configureStore } from "@reduxjs/toolkit";
// import createSagaMiddleware from "redux-saga";
// import { persistStore, persistReducer } from "redux-persist";

// import rootReducer from "../reducers";
// import RootSaga from "../rootSaga";
// import secureStorage from "../secureStorage";

// function Store() {
//   const sagaMiddleware = createSagaMiddleware();

//   const persistConfig = {
//     key: "root",
//     storage: secureStorage,
//     whitelist: ["login"],
//   };

//   const persistedReducer = persistReducer(persistConfig, rootReducer);

//   const store = configureStore({
//     reducer: persistedReducer,
//     middleware: (getDefaultMiddleware) =>
//       getDefaultMiddleware({
//         serializableCheck: false,
//       }).concat(sagaMiddleware),
//   });

//   sagaMiddleware.run(RootSaga);

//   const persistor = persistStore(store);

//   return { store, persistor };
// }

// export type AppStore = ReturnType<typeof Store>["store"];
// export type AppDispatch = AppStore["dispatch"];

// export default Store;
