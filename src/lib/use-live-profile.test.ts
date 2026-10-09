import { describe, expect, test } from "bun:test";

import { DEMO_PROFILE } from "./studio-data";
import { resolveLiveState, type ProfileQuery } from "./use-live-profile";

const ready: ProfileQuery = {
  isPending: false,
  isError: false,
  data: { status: "ready", profile: DEMO_PROFILE, availability: "live" },
};

describe("resolveLiveState", () => {
  test("a failed refetch keeps the last loaded profile", () => {
    const state = resolveLiveState("octocat", "octocat", { ...ready, isError: true });
    expect(state.phase).toBe("ready");
    expect(state.profile?.username).toBe(DEMO_PROFILE.username);
    expect(state.availability).toBe("live");
  });

  test("a failed first lookup stays on the quiet error", () => {
    const state = resolveLiveState("octocat", "octocat", {
      isPending: false,
      isError: true,
      data: undefined,
    });
    expect(state.phase).toBe("error");
    expect(state.profile).toBeNull();
  });

  test("a login that is still settling does not show the previous profile", () => {
    const state = resolveLiveState("torvalds", "octocat", ready);
    expect(state.phase).toBe("loading");
    expect(state.profile).toBeNull();
  });

  test("a missing login is not drawn as live data", () => {
    const state = resolveLiveState("octocat", "octocat", {
      isPending: false,
      isError: false,
      data: { status: "missing" },
    });
    expect(state.phase).toBe("missing");
    expect(state.profile).toBeNull();
  });
});
