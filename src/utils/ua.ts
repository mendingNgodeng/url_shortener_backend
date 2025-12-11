import { UAParser } from 'ua-parser-js';

export function parseUA(ua: string | undefined) {
  if (!ua) return {};

  const parser = new UAParser(ua);
  const result = parser.getResult();

  return {
    browser: result.browser.name ?? null,
    os: result.os.name ?? null,
    device: result.device.type ?? 'desktop',
  };
}
