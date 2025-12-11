export async function locationUp(ip: string) {
  try {
    const res = await fetch(`https://ipwho.is/${ip}`);
    const data = await res.json();

    if (data.success === false) return {};

    return {
      country: data.country ?? '-',
      city: data.city ?? '-',
    };
  } catch (e) {
    return {};
  }
}
