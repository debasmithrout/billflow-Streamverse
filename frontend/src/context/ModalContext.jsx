// src/context/ModalContext.jsx
import { createContext, useContext, useState } from "react";
import ContentDetailsModal from "../components/customer/Shared/ContentDetailsModal";

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  const [activeContentDetails, setActiveContentDetails] = useState(null);

  const openContentDetails = (content) => {
    setActiveContentDetails(content);
  };

  const closeContentDetails = () => {
    setActiveContentDetails(null);
  };

  return (
    <ModalContext.Provider
      value={{
        activeContentDetails,
        openContentDetails,
        closeContentDetails
      }}
    >
      {children}
      {activeContentDetails && (
        <ContentDetailsModal
          item={activeContentDetails}
          onClose={closeContentDetails}
        />
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
