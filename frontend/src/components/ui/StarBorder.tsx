import React from 'react';

export type StarBorderProps<T extends React.ElementType = 'button'> = {
  as?: T;
  className?: string;
  innerClassName?: string;
  color?: string;
  speed?: string;
  children?: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'className' | 'color'>;

export const StarBorder = <T extends React.ElementType = 'button'>({
  as,
  className = '',
  innerClassName = '',
  color = 'white',
  speed = '6s',
  children,
  ...rest
}: StarBorderProps<T>) => {
  const Component = (as || 'button') as React.ElementType;

  return (
    <Component
      className={`relative inline-block p-[1.5px] overflow-hidden rounded-2xl select-none transition-transform hover:scale-[1.02] active:scale-[0.98] ${className}`}
      {...rest}
    >
      {/* Animated Star Glow - Bottom */}
      <div
        className="absolute w-[300%] h-[60%] opacity-80 bottom-[-11px] right-[-250%] rounded-full animate-star-movement-bottom z-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 12%)`,
          animationDuration: speed,
        }}
      />

      {/* Animated Star Glow - Top */}
      <div
        className="absolute w-[300%] h-[60%] opacity-80 top-[-10px] left-[-250%] rounded-full animate-star-movement-top z-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 12%)`,
          animationDuration: speed,
        }}
      />

      {/* Button Inner Content Surface */}
      <div
        className={`relative z-10 flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-[15px] transition-colors ${innerClassName}`}
      >
        {children}
      </div>
    </Component>
  );
};
