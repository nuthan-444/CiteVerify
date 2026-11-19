/**
 * Notification service for CiteVerify verification pipeline alerts.
 * Uses Web Audio API for a pristine chime sound and HTML5 Notification API for desktop alerts.
 */

export const NOTIFICATION_STORAGE_KEY = 'citeverify_notify_when_done';

/**
 * Play a gentle, elegant two-tone chime via Web Audio API.
 */
export function playNotificationChime() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const now = ctx.currentTime;

    // Tone 1: High E (659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.18, now + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.5);

    // Tone 2: A5 (880.00 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, now + 0.12);
    gain2.gain.setValueAtTime(0, now + 0.12);
    gain2.gain.linearRampToValueAtTime(0.25, now + 0.16);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.9);
  } catch (err) {
    console.warn('Audio chime playback failed:', err);
  }
}

/**
 * Request desktop notification permissions from the browser.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  try {
    if (Notification.permission === 'granted') return true;
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
  } catch (err) {
    console.warn('Notification permission request error:', err);
  }
  return false;
}

/**
 * Trigger verification completion alert.
 */
export function notifyVerificationComplete(filename?: string, trustScore?: number) {
  // Always play audio chime if notifications are enabled
  playNotificationChime();

  // Send desktop notification if supported and granted
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      const scoreText = trustScore !== undefined ? ` • Trust Score: ${Math.round(trustScore)}%` : '';
      new Notification('CiteVerify: Paper Audit Complete', {
        body: `Verification for "${filename || 'your academic paper'}" has completed${scoreText}. Factual claims and citations are ready to inspect.`,
        icon: '/favicon.ico',
      });
    } catch (err) {
      console.warn('Desktop notification dispatch error:', err);
    }
  }
}
