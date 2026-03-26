import { describe, expect, it } from "vitest";
import { getAlertPattern, getVoiceMessage } from "./audio-alerts";

describe("audio alerts", () => {
  it("returns stronger multi-tone pattern for high risk", () => {
    const highPattern = getAlertPattern("high");
    const lowPattern = getAlertPattern("low");

    expect(highPattern.length).toBeGreaterThan(lowPattern.length);
    expect(highPattern[0].frequency).toBeGreaterThan(lowPattern[0].frequency);
  });

  it("returns voice guidance text by severity", () => {
    expect(getVoiceMessage("high")).toContain("High burnout risk");
    expect(getVoiceMessage("moderate")).toContain("Moderate burnout risk");
    expect(getVoiceMessage("low")).toContain("Low burnout risk");
  });
});
