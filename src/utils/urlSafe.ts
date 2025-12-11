import {
  BLOCKED_KEYWORDS,
  BLOCKED_REGEX,
  BLOCKED_WILDCARD,
  SUSPICIOUS_TLDS,
  DANGEROUS_DOMAIN_PATTERNS,
} from './urlWords';

export async function checkURLSafety(url: string, googleApiKey?: string) {
  const lower = url.toLowerCase();

  //  BLOCKED KEYWORDS (hard)
  if (BLOCKED_KEYWORDS.some((k: any) => lower.includes(k))) {
    return { safe: false, reason: 'Blocked keyword detected' };
  }

  //  REGEX FILTER
  if (BLOCKED_REGEX.some((re: any) => re.test(lower))) {
    return { safe: false, reason: 'Malicious pattern detected' };
  }

  //  TYPO / OBFUSCATION FILTER
  if (BLOCKED_WILDCARD.some((re: any) => re.test(lower))) {
    return { safe: false, reason: 'Obfuscated malicious term detected' };
  }

  //  DOMAIN HEURISTIC
  try {
    const { hostname } = new URL(url);

    const tld = hostname.split('.').pop();
    if (tld && SUSPICIOUS_TLDS.includes(tld)) {
      return { safe: false, reason: 'Suspicious top-level domain' };
    }

    if (DANGEROUS_DOMAIN_PATTERNS.some((re) => re.test(hostname))) {
      return { safe: false, reason: 'Suspicious domain structure' };
    }
  } catch (_) {
    return { safe: false, reason: 'Invalid URL' };
  }

  // GOOGLE SAFE BROWSING API
  if (googleApiKey) {
    const res = await fetch(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${googleApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: { clientId: 'url-shortener', clientVersion: '1.0' },
          threatInfo: {
            threatTypes: [
              'MALWARE',
              'SOCIAL_ENGINEERING',
              'UNWANTED_SOFTWARE',
              'POTENTIALLY_HARMFUL_APPLICATION',
            ],
            platformTypes: ['ANY_PLATFORM'],
            threatEntryTypes: ['URL'],
            threatEntries: [{ url }],
          },
        }),
      }
    );

    const data = await res.json();
    if (data.matches?.length) {
      return {
        safe: false,
        reason: 'Google Safe Browsing: Threat detected',
        threat: data.matches,
      };
    }
  }

  return { safe: true };
}
