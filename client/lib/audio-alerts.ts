import type { BurnoutRiskLevel } from "@shared/api";

export type AlertPreferences = {
  enabled: boolean;
  voiceEnabled: boolean;
  volume: number;
};

type ToneStep = {
  frequency: number;
  durationMs: number;
  pauseMs?: number;
  type?: OscillatorType;
};

export const ALERT_PREFERENCES_KEY = "alertPreferences";

const defaultPreferences: AlertPreferences = {
  enabled: false,
  voiceEnabled: true,
  volume: 0.6,
};

export function loadAlertPreferences(): AlertPreferences {
  const raw = localStorage.getItem(ALERT_PREFERENCES_KEY);
  if (!raw) {
    return defaultPreferences;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AlertPreferences>;
    return {
      enabled: Boolean(parsed.enabled),
      voiceEnabled: parsed.voiceEnabled ?? true,
      volume: clampVolume(parsed.volume ?? 0.6),
    };
  } catch {
    return defaultPreferences;
  }
}

export function saveAlertPreferences(prefs: AlertPreferences): void {
  localStorage.setItem(
    ALERT_PREFERENCES_KEY,
    JSON.stringify({
      enabled: prefs.enabled,
      voiceEnabled: prefs.voiceEnabled,
      volume: clampVolume(prefs.volume),
    }),
  );
}

export function getAlertPattern(level: BurnoutRiskLevel): ToneStep[] {
  if (level === "high") {
    return [
      { frequency: 820, durationMs: 220, pauseMs: 70, type: "sawtooth" },
      { frequency: 620, durationMs: 220, pauseMs: 70, type: "sawtooth" },
      { frequency: 820, durationMs: 260, pauseMs: 90, type: "square" },
      { frequency: 620, durationMs: 280, type: "square" },
    ];
  }

  if (level === "moderate") {
    return [
      { frequency: 660, durationMs: 180, pauseMs: 80, type: "triangle" },
      { frequency: 520, durationMs: 220, type: "triangle" },
    ];
  }

  return [
    { frequency: 440, durationMs: 260, pauseMs: 60, type: "sine" },
    { frequency: 520, durationMs: 300, type: "sine" },
  ];
}

export function getVoiceMessage(level: BurnoutRiskLevel): string {
  if (level === "high") {
    return "High burnout risk detected. Please acknowledge this alert and start immediate recovery actions.";
  }

  if (level === "moderate") {
    return "Moderate burnout risk detected. Consider taking a short reset and reviewing support recommendations.";
  }

  return "Low burnout risk detected. Keep your healthy routine going.";
}

export async function playSeverityAlert(
  level: BurnoutRiskLevel,
  prefs: AlertPreferences,
): Promise<void> {
  if (!prefs.enabled) {
    return;
  }

  try {
    const AudioContextCtor =
      window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (AudioContextCtor) {
      const ctx = new AudioContextCtor();
      const gainNode = ctx.createGain();
      gainNode.gain.value = clampVolume(prefs.volume);
      gainNode.connect(ctx.destination);

      const pattern = getAlertPattern(level);
      let startAt = ctx.currentTime;

      for (const step of pattern) {
        const osc = ctx.createOscillator();
        osc.type = step.type ?? "sine";
        osc.frequency.setValueAtTime(step.frequency, startAt);
        osc.connect(gainNode);
        osc.start(startAt);

        const end = startAt + step.durationMs / 1000;
        osc.stop(end);

        startAt = end + (step.pauseMs ?? 0) / 1000;
      }
    }

    if (prefs.voiceEnabled && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(getVoiceMessage(level));
      utterance.rate = level === "high" ? 1.02 : 0.95;
      utterance.pitch = level === "high" ? 1 : 0.95;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  } catch {
    // Browsers may block audio creation before user gesture; fail silently.
  }
}

function clampVolume(volume: number): number {
  return Math.max(0.05, Math.min(1, volume));
}
