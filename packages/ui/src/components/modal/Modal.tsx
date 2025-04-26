import { Box } from '../primitives';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, children, className = '' }) => {
  if (!open) return null;
  return (
    <Box className={`flex items-center justify-center bg-black bg-opacity-40 ${className}`} onClick={onClose}>
      <Box className="bg-white rounded-lg shadow-lg p-6 min-w-[300px] max-w-[90vw]" onClick={e => e.stopPropagation()}>
        {children}
      </Box>
    </Box>
  );
};
