import React from 'react';
import { clsx } from 'clsx';
import './input.scss';

export interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  textColor?: string;
  variant?: 'underline' | 'outlined';
  size?: 'md' | 'lg';
}

export function Input({
  label,
  placeholder,
  value,
  onChange,
  className = '',
  textColor = '000000',
  variant = 'underline',
  size = 'md',
}: InputProps) {
  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(event.target.value);
    }
  };

  const inputClass = clsx(
    'input-box',
    `input-box--${variant}`,
    {
      'text-base py-2': size === 'md',
      'text-lg py-3': size === 'lg',
    }
  );

  const labelClass = clsx(
    'input-label',
    {
      'text-sm': size === 'md',
      'text-base': size === 'lg',
    }
  );

  return (
    <view className={`input-container ${className}`}>
      {label && <text className={labelClass}>{label}</text>}
      <view className="input-wrapper">
        <input
          className={inputClass}
          value={value}
          onChange={handleInput}
          placeholder={placeholder}
          text-color={textColor}
          style={{ fontSize: size === 'lg' ? '18px' : '16px' }}
        />
      </view>
    </view>
  );
}
