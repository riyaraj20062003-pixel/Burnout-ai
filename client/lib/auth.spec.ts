// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { clearAuthSession, getStoredRole, getToken, setAuthSession } from "./auth";

describe("auth storage helpers", () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("stores and retrieves token and role", () => {
    setAuthSession("token-value", "mentor");

    expect(getToken()).toBe("token-value");
    expect(getStoredRole()).toBe("mentor");
  });

  it("extracts role from token payload when role key is absent", () => {
    const payload = Buffer.from(
      JSON.stringify({ sub: "u-1", email: "student@example.com", role: "student" }),
      "utf8",
    ).toString("base64");
    localStorage.setItem("token", `header.${payload}.sig`);

    expect(getStoredRole()).toBe("student");
  });

  it("clears all auth session state", () => {
    setAuthSession("token-value", "parent");
    clearAuthSession();

    expect(getToken()).toBeNull();
    expect(getStoredRole()).toBeNull();
  });
});
