import AppRoutes from "./routes/AppRoutes";
import ToastProvider from "./components/common/ToastProvider";
import ModalProvider from "./components/common/ModalProvider";
import { LanguageProvider } from "./context/LanguageContext";

function App() {
  return (
    <LanguageProvider>
      <ToastProvider>
        <ModalProvider>
          <AppRoutes />
        </ModalProvider>
      </ToastProvider>
    </LanguageProvider>
  );
}

export default App;