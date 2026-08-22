// src/components/common/ModalProvider.jsx
import React, { createContext, useState, useCallback } from 'react';
import ConfirmActionModal from './ConfirmActionModal';
import RefundRequestModal from './RefundRequestModal';

export const ModalContext = createContext(null);

export default function ModalProvider({ children }) {
  const [confirmConfig, setConfirmConfig] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [refundConfig, setRefundConfig] = useState(null);
  const [refundLoading, setRefundLoading] = useState(false);

  const showConfirm = useCallback((config) => {
    setConfirmConfig(config);
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmConfig(null);
    setConfirmLoading(false);
  }, []);

  const handleConfirmAction = async (payload) => {
    if (!confirmConfig?.onConfirm) return;
    try {
      setConfirmLoading(true);
      await confirmConfig.onConfirm(payload);
      setConfirmConfig(null);
    } catch (err) {
      console.error("Confirm action error:", err);
    } finally {
      setConfirmLoading(false);
    }
  };

  const showRefund = useCallback((config) => {
    setRefundConfig(config);
  }, []);

  const closeRefund = useCallback(() => {
    setRefundConfig(null);
    setRefundLoading(false);
  }, []);

  const handleRefundAction = async (reason) => {
    if (!refundConfig?.onConfirm) return;
    try {
      setRefundLoading(true);
      await refundConfig.onConfirm(reason);
      setRefundConfig(null);
    } catch (err) {
      console.error("Refund submit error:", err);
    } finally {
      setRefundLoading(false);
    }
  };

  return (
    <ModalContext.Provider value={{ showConfirm, showRefund }}>
      {children}

      {/* Confirmation Modal */}
      {confirmConfig && (
        <ConfirmActionModal
          isOpen={!!confirmConfig}
          onClose={closeConfirm}
          onConfirm={handleConfirmAction}
          title={confirmConfig.title}
          description={confirmConfig.description}
          confirmText={confirmConfig.confirmText}
          cancelText={confirmConfig.cancelText}
          variant={confirmConfig.variant}
          loading={confirmLoading}
          details={confirmConfig.details}
        />
      )}

      {/* Refund Request Modal */}
      {refundConfig && (
        <RefundRequestModal
          isOpen={!!refundConfig}
          onClose={closeRefund}
          onConfirm={handleRefundAction}
          invoiceId={refundConfig.invoiceId}
          amount={refundConfig.amount}
          loading={refundLoading}
        />
      )}
    </ModalContext.Provider>
  );
}
