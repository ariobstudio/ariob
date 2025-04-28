import { Box, Text } from '@/components';
export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, children, className = '', title }) => {
  if (!open) return null;
  return (
    <Box className="fixed z-10 top-0 left-0 right-0 bottom-0 flex items-center justify-center">
      <Box 
        className="absolute top-0 left-0 right-0 bottom-0 bg-gray-500 opacity-75" 
        bindtap={onClose}
      />
      
      <Box className="relative z-20 flex items-center justify-center w-full h-full px-4">
        <Box 
          className={`relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md transform ${className}`}
        >
          {title && (
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              {title}
            </Text>
          )}
          {children}
        </Box>
      </Box>
    </Box>
  );
};
