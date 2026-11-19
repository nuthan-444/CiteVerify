import React, { useState } from 'react';

interface DownloadSwitchProps {
  onDownload: () => void | Promise<void>;
  label?: string;
  variant?: 'html' | 'json';
}

/**
 * Inspired by uiverse.io/nazar-gavrylyk/evil-dragon-24
 * A sleek animated download switch — black monochrome palette.
 */
export const DownloadSwitch: React.FC<DownloadSwitchProps> = ({
  onDownload,
  label = 'Download',
  variant = 'html',
}) => {
  const [active, setActive] = useState(false);

  const handleClick = async () => {
    if (active) return;
    setActive(true);
    try {
      await onDownload();
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setTimeout(() => setActive(false), 800);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={active}
      className="download-switch-btn"
      aria-label={label}
      title={label}
    >
      <span className="download-switch-track">
        {/* Arrow icon → bouncing arrow on idle */}
        <span className={`download-switch-icon ${active ? 'icon-downloading' : 'icon-idle'}`}>
          {active ? (
            /* Spinning loader ring */
            <svg
              width="16" height="16" viewBox="0 0 16 16" fill="none"
              className="ds-spin"
            >
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeDashoffset="10" strokeLinecap="round" />
            </svg>
          ) : (
            /* Download arrow */
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v8M4.5 7l3.5 3.5L11.5 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2.5 12.5h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          )}
        </span>

        <span className="download-switch-label">
          {active ? (variant === 'html' ? 'Exporting…' : 'Exporting…') : label}
        </span>

        {/* Sliding pill */}
        <span className={`download-switch-pill ${active ? 'pill-active' : ''}`} />
      </span>

      <style>{`
        .download-switch-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          cursor: pointer;
          border: none;
          background: none;
          padding: 0;
          outline: none;
          user-select: none;
        }
        .download-switch-btn:disabled {
          cursor: default;
        }

        .download-switch-track {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 14px 7px 10px;
          background: #0a0a0a;
          border-radius: 100px;
          border: 1.5px solid #0a0a0a;
          overflow: hidden;
          transition: background 0.3s ease, border-color 0.3s ease;
          min-width: 140px;
        }
        .download-switch-btn:hover:not(:disabled) .download-switch-track {
          background: #1a1a1a;
          border-color: #333;
        }
        .download-switch-btn:active:not(:disabled) .download-switch-track {
          transform: scale(0.97);
        }
        .download-switch-track {
          transition: transform 0.1s ease;
        }

        .download-switch-pill {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, #333 0%, #0a0a0a 100%);
          border-radius: 100px;
          transform: translateX(-100%);
          transition: transform 0s;
          z-index: 0;
          pointer-events: none;
        }
        .download-switch-pill.pill-active {
          transform: translateX(0%);
          transition: transform 2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .download-switch-icon {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }
        .icon-idle svg {
          animation: ds-bounce 1.4s ease-in-out infinite;
        }
        @keyframes ds-bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(3px); }
        }

        .ds-spin {
          animation: ds-rotate 0.9s linear infinite;
        }
        @keyframes ds-rotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        .download-switch-label {
          position: relative;
          z-index: 1;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.03em;
          color: #ffffff;
          white-space: nowrap;
          transition: opacity 0.2s;
        }
      `}</style>
    </button>
  );
};
