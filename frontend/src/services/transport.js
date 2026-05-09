function wailsService(name) {
  if (typeof window !== 'undefined' && window.go?.devtoolbox?.service?.[name]) {
    return window.go.devtoolbox.service[name];
  }
  return null;
}

export function createAdapter(serviceName, httpModule) {
  const wails = wailsService(serviceName);

  return Object.fromEntries(
    Object.entries(httpModule).map(([key, httpFn]) => [
      key,
      async (...args) => {
        if (wails && typeof wails[key] === 'function') {
          return wails[key](...args);
        }
        return httpFn(...args);
      },
    ])
  );
}
