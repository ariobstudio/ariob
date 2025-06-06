import { useEffect, useRef } from 'react';
import { gun } from '../core/gun';

/**
 * useRealTime Hook
 * 
 * A low-level React hook for subscribing to real-time updates from Gun.
 * Use this when you need direct Gun subscriptions outside of the Thing pattern.
 * 
 * @param path - The Gun path to subscribe to
 * @param callback - Function called with updates
 * 
 * @example
 * ```tsx
 * function ChatRoom({ roomId }: { roomId: string }) {
 *   const [messages, setMessages] = useState<Message[]>([]);
 *   
 *   // Subscribe to real-time updates
 *   useRealTime(`chat/${roomId}/messages`, (data) => {
 *     if (data && typeof data === 'object') {
 *       const newMessages = Object.values(data).filter(Boolean);
 *       setMessages(newMessages as Message[]);
 *     }
 *   });
 *   
 *   return (
 *     <list>
 *       {messages.map(msg => (
 *         <list-item item-key={msg.id} key={msg.id}>{msg.text}</list-item>
 *       ))}
 *     </list>
 *   );
 * }
 * ```
 */
export const useRealTime = (
  path: string | null | undefined,
  callback: (data: any) => void
) => {
  const callbackRef = useRef(callback);
  
  // Update callback ref on each render
  callbackRef.current = callback;

  useEffect(() => {
    if (!path) return;

    // Subscribe to Gun path
    const gunRef = gun.get(path);
    
    gunRef.on((data: any) => {
      callbackRef.current(data);
    });

    // Cleanup subscription
    return () => {
      gunRef.off();
    };
  }, [path]);
};
