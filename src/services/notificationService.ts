// Notification & Sound Alert Service for MRT Route Disruptions
// Handles Web Notifications API, Web Audio API chime, and Haptic Vibration

class NotificationService {
  private hasAudioContext: AudioContext | null = null;

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) return 'denied';
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch {
      return Notification.permission;
    }
  }

  public playAlertSound(): void {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      if (!this.hasAudioContext) {
        this.hasAudioContext = new AudioCtx();
      }
      if (this.hasAudioContext.state === 'suspended') {
        this.hasAudioContext.resume();
      }

      const ctx = this.hasAudioContext;
      const now = ctx.currentTime;

      // Two-tone friendly chime (high-low ping)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now); // A5
      osc1.frequency.exponentialRampToValueAtTime(1174.66, now + 0.15); // D6
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(587.33, now + 0.2); // D5
      osc2.frequency.exponentialRampToValueAtTime(880, now + 0.45);
      gain2.gain.setValueAtTime(0.25, now + 0.2);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.2);
      osc2.stop(now + 0.6);
    } catch {
      // Audio autoplay may be prevented by browser until first user gesture
    }
  }

  public triggerVibration(pattern: number[] = [250, 100, 250, 100, 400]): void {
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // ignore
      }
    }
  }

  public sendNotification(
    title: string,
    options: {
      body: string;
      tag?: string;
      icon?: string;
      data?: unknown;
    }
  ): boolean {
    // 1. Play auditory chime and vibration regardless of web notification permissions
    this.playAlertSound();
    this.triggerVibration();

    // 2. Trigger native OS / browser notification if supported and granted
    if (this.isSupported() && Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body: options.body,
          icon: options.icon || '/logo.png',
          tag: options.tag,
          requireInteraction: true,
        });

        notif.onclick = () => {
          window.focus();
          notif.close();
        };

        return true;
      } catch (err) {
        console.warn('Could not spawn browser notification:', err);
      }
    }

    return false;
  }
}

export const notificationService = new NotificationService();
