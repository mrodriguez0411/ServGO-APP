declare module 'modal-react-native-web' {
  import { ComponentType } from 'react';
  
  interface ModalProps {
    isOpen: boolean;
    onRequestClose: () => void;
    children?: React.ReactNode;
    style?: any;
    contentLabel?: string;
    overlayClassName?: string;
    className?: string;
    appElement?: HTMLElement | null;
    ariaHideApp?: boolean;
  }

  const Modal: ComponentType<ModalProps> & {
    setAppElement: (element: string | HTMLElement | null) => void;
  };

  export default Modal;
}
