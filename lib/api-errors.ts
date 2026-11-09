// Maps API failures to messages that are safe and useful to show to HR users.
export interface ApiErrorBody {
  message?: string;
  errors?: { fieldErrors?: Record<string, string[] | undefined> };
}

export function friendlyError(status: number, body: ApiErrorBody | null): string {
  if (status === 400) {
    const fields = body?.errors?.fieldErrors;
    const first = fields && Object.values(fields).flat().find(Boolean);
    return first ?? "Some of the input is invalid. Please check the form.";
  }
  if (status === 502) {
    return "The AI service could not analyse this resume. Please try again in a moment.";
  }
  if (status === 503) {
    return "The database is temporarily unavailable. Please try again shortly.";
  }
  if (status === 0) {
    return "Could not reach the server. Check your connection and try again.";
  }
  return "Something went wrong. Please try again.";
}
