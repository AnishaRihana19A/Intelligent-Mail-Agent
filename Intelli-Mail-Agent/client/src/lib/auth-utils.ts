export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

// No-op for local dev — auth is mocked so 401 should never occur
export function redirectToLogin(toast?: (options: { title: string; description: string; variant: string }) => void) {
  if (toast) {
    toast({
      title: "Session Error",
      description: "Please refresh the page.",
      variant: "destructive",
    });
  }
  // Do NOT redirect — auth is mocked locally
}
