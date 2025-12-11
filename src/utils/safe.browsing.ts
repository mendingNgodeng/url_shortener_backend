// unused

export async function checkWithGoogleSafeBrowsing(url: string) {
  const apiKey = process.env.GOOGLE_API_SAFE_BROWSING;

  if (!apiKey) {
    console.error('Missing GOOGLE_SAFE_BROWSING_KEY');
    return { safe: true };
  }

  const requestBody = {
    client: {
      clientId: 'url-shortener',
      clientVersion: '1.0.0',
    },
    threatInfo: {
      threatTypes: [
        'MALWARE',
        'SOCIAL_ENGINEERING',
        'THREAT_TYPE_UNSPECIFIED',
        'POTENTIALLY_HARMFUL_APPLICATION',
        'UNWANTED_SOFTWARE',
      ],
      platformTypes: ['ANY_PLATFORM'],
      threatEntryTypes: ['URL'],
      threatEntries: [{ url }],
    },
  };

  const res = await fetch(
    `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    }
  );

  const data = await res.json();

  // kalau kosong → aman
  if (!data || !data.matches) {
    return { safe: true };
  }

  return {
    safe: false,
    matches: data.matches,
  };
}
