import { useCallback, useMemo, useState } from "react";
import { ModalContext } from "./ModelContext";
import Modal from "./Model";

export default function ModalProvider({ children }) {
  // { Component, props } | null
  const [modal, setModal] = useState(null);

  const openModal = useCallback(
    (Component, props = {}) => setModal({ Component, props }),
    [],
  );
  const closeModal = useCallback(() => setModal(null), []);

  const value = useMemo(
    () => ({ openModal, closeModal }),
    [openModal, closeModal],
  );

  const Content = modal?.Component;

  return (
    <ModalContext.Provider value={value}>
      {children}

      {Content && (
        <Modal
          onClose={closeModal}
          className={modal.props?.modalClassName}
          hideCloseButton={modal.props?.hideCloseButton}
          dismissible={modal.props?.dismissible !== false}
        >
          <Content {...modal.props} onClose={closeModal} />
        </Modal>
      )}
    </ModalContext.Provider>
  );
}
