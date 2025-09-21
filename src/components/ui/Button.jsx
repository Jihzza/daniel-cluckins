// src/components/ui/Button.jsx
import { motion, useReducedMotion } from 'framer-motion';

export default function Button({
  children,
  className = '',
  isLoading = false,
  noOuterPadding = false,
  ...rest
}) {
  const prefersReduced = useReducedMotion();
  const disabled = rest.disabled || isLoading;

  const motionProps =
    prefersReduced || disabled
      ? {}
      : { whileHover: { scale: 1.06 }, whileTap: { scale: 0.95 }, transition: { duration: 0.12 } };

  const btn = (
    <motion.button
      type="button"
      className={[
        'w-auto px-3 py-2 rounded-lg bg-[#BFA200] text-black font-semibold',
        'shadow-lg hover:shadow-xl transition-shadow duration-200',
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
        className,
      ].join(' ')}
      disabled={disabled}
      aria-busy={isLoading ? 'true' : undefined}
      {...motionProps}
      {...rest}
    >
      {isLoading ? 'Loading…' : children}
    </motion.button>
  );

  return noOuterPadding ? btn : <div className="py-2">{btn}</div>;
}
