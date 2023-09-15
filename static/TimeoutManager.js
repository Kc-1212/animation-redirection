let timeouts = [];

export function setTimeout(callback, delay) {
  const timeoutId = window.setTimeout(callback, delay);
  timeouts.push(timeoutId);
  return timeoutId;
}

export function clearTimeouts() {
  timeouts.forEach((timeoutId) => {
    window.clearTimeout(timeoutId);
  });
  timeouts = [];
}
