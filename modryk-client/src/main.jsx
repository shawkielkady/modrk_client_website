import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store";
import "./index.css";
import App from "./App.jsx";
import "./i18n";
import ModalProvider from "./shared components/model/ModelProvider.jsx";
import ToastProvider from "./shared components/toast/ToastProvider.jsx";
import LoaderProvider from "./shared components/loader/LoaderProvider.jsx";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <BrowserRouter>
      <LoaderProvider>
        <ToastProvider>
          <ModalProvider>
            <App />
          </ModalProvider>
        </ToastProvider>
      </LoaderProvider>
    </BrowserRouter>
  </Provider>,
);
