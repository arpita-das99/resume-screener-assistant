// Text beyond these lengths is truncated before it is sent to the model.
// Tuned to stay well inside Groq's per-request / tokens-per-minute limits
export const MAX_JD_CHARS = 8000;
export const MAX_RESUME_CHARS = 12000;

// Hard ceiling accepted by the API; protects the server from huge payloads.
export const HARD_MAX_CHARS = 100000;
