/**
 * Stable public API version. Bump only for breaking changes; additive fields
 * do not require a bump. Sent on every response as `X-Sigil-Api-Version` and
 * exposed by `/health`.
 */
export const API_VERSION = "1";
