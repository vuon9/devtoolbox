// HTTP client for WindowControls
// For browser testing - window controls are not available in browser mode

export function Minimise(): Promise<void> {
  return Promise.resolve();
}

export function Maximise(): Promise<void> {
  return Promise.resolve();
}

export function Close(): Promise<void> {
  return Promise.resolve();
}

export function Show(): Promise<void> {
  return Promise.resolve();
}

export function Hide(): Promise<void> {
  return Promise.resolve();
}

export function IsVisible(): Promise<boolean> {
  return Promise.resolve(true);
}

export function IsMinimised(): Promise<boolean> {
  return Promise.resolve(false);
}

export function Restore(): Promise<void> {
  return Promise.resolve();
}

export function Focus(): Promise<void> {
  return Promise.resolve();
}
