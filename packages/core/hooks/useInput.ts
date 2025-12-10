import { useCallback, useState } from 'react';

/** Input event detail */
export interface InputDetail {
  value: string;
  selectionStart?: number;
  selectionEnd?: number;
}

/** Input event wrapper */
export interface InputEvent {
  detail: InputDetail;
  nativeEvent?: any;
}

/** Options for useInput hook */
export interface UseInputOptions<T = string> {
  onChange?: (value: T, event?: InputEvent) => void;
  validate?: (value: T) => boolean;
  format?: (value: T) => T;
}

/** Hook for controlled text input. */
function useInput<T = string>(initial: T, options?: UseInputOptions<T>) {
  const [value, setValue] = useState<T>(initial);

  const reset = useCallback(() => {
    setValue(initial);
  }, [initial]);

  const clear = useCallback(() => {
    setValue('' as T);
  }, []);

  const handle = useCallback(
    (e: InputEvent | string) => {
      const raw = typeof e === 'string' ? e : (e.detail?.value as T);
      const formatted = options?.format ? options.format(raw) : raw;

      if (options?.validate && !options.validate(formatted)) {
        return;
      }

      setValue(formatted);
      options?.onChange?.(formatted, typeof e === 'string' ? undefined : e);
    },
    [options],
  );

  return { value, reset, clear, handle };
}

export default useInput;
