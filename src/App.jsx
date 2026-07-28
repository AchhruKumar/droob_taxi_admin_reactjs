import AppRoutes from "./routes";
import { Provider } from "react-redux";
import Store from "./redux/store";
import { ToastProvider } from "./utils/toaster";

function App() {
  const store = Store();

  return (
    <Provider store={store}>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </Provider>
  );
}

export default App;
