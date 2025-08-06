import React, { ReactNode } from 'react';
import { cn } from '../../../lib/utils'; // Importa la función cn (classnames)

// ✅ Extendemos los atributos nativos de <button>
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'small' | 'large' | 'icon';
  className?: string;
  children?: ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'default',
  className,
  children,
  ...props // ✅ Incluye onClick, type, disabled, etc.
}) => {
  const baseClasses = `
    inline-flex items-center justify-center
    font-medium
    whitespace-nowrap
    rounded-md
    transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
    disabled:opacity-50 disabled:pointer-events-none
  `;

  const variantClasses = {
    default: 'bg-blue-500 text-white hover:bg-blue-600',
    outline: 'border border-gray-300 hover:bg-gray-100',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    ghost: 'hover:bg-gray-100',
    link: 'text-blue-500 underline hover:text-blue-700',
  };

  const sizeClasses = {
    default: 'px-4 py-2.5 text-sm',
    small: 'px-3 py-2 text-xs',
    large: 'px-6 py-3 text-base',
    icon: 'h-9 w-9 p-0',
  };

  const combinedClasses = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  return (
    <button
      className={combinedClasses}
      {...props} // ✅ Acá se aplican type, onClick, etc.
    >
      {children}
    </button>
  );
};

export default Button;
