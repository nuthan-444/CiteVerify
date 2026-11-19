import React, { useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import {
  NOTIFICATION_STORAGE_KEY,
  requestNotificationPermission,
  playNotificationChime,
} from '../../lib/notifications';

export interface BellToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  activeLabel?: string;
  inactiveLabel?: string;
  className?: string;
  showPreviewChime?: boolean;
}

export const BellToggle: React.FC<BellToggleProps> = ({
  checked: controlledChecked,
  onChange,
  activeLabel = 'Notify when done',
  inactiveLabel = 'Notify me',
  className = '',
  showPreviewChime = true,
}) => {
  const [internalChecked, setInternalChecked] = useState<boolean>(() => {
    try {
      return localStorage.getItem(NOTIFICATION_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [isRinging, setIsRinging] = useState(false);

  const isChecked = controlledChecked !== undefined ? controlledChecked : internalChecked;

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const nextState = !isChecked;

    if (controlledChecked === undefined) {
      setInternalChecked(nextState);
    }
    try {
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, String(nextState));
    } catch {
      // Ignore localStorage errors
    }

    if (nextState) {
      // Trigger damped ring animation
      setIsRinging(true);
      setTimeout(() => setIsRinging(false), 800);

      // Play soft preview chime
      if (showPreviewChime) {
        playNotificationChime();
      }

      // Request browser desktop permission
      await requestNotificationPermission();
    }

    if (onChange) {
      onChange(nextState);
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      onClick={handleToggle}
      className={`relative inline-flex items-center gap-2 h-8 px-3 rounded-full text-xs font-semibold select-none transition-all duration-300 ease-out cursor-pointer shadow-xs border ${
        isChecked
          ? 'bg-black text-white border-black hover:bg-neutral-900'
          : 'bg-neutral-100 text-neutral-600 border-neutral-300 hover:bg-neutral-200 hover:text-black'
      } ${className}`}
      title={isChecked ? 'Notifications enabled when verification completes' : 'Click to get notified when verification completes'}
    >
      {/* Bell Icon with Damped Ring Animation */}
      <span
        className={`relative flex items-center justify-center transition-transform origin-top ${
          isRinging ? 'animate-bell-ring' : ''
        }`}
      >
        {isChecked ? (
          <Bell className="w-3.5 h-3.5 text-white fill-current" />
        ) : (
          <BellOff className="w-3.5 h-3.5 text-neutral-500" />
        )}

        {/* Notification active dot */}
        {isChecked && (
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-white ring-2 ring-black" />
        )}
      </span>

      {/* Label with blur-crossfade transition */}
      <span
        key={isChecked ? 'active' : 'inactive'}
        className="animate-label-crossfade tracking-tight whitespace-nowrap text-[11px]"
      >
        {isChecked ? activeLabel : inactiveLabel}
      </span>
    </button>
  );
};
