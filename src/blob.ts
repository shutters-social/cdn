import { type Preset, presets } from './presets';

const wsrvUrl = 'https://wsrv.nl' as const;

export const getBlob = (
  pdsUrl: string,
  did: string,
  cid: string,
  preset: Preset,
) => {
  const pdsBlobUrl = new URL('/xrpc/com.atproto.sync.getBlob', pdsUrl);
  pdsBlobUrl.searchParams.set('did', did);
  pdsBlobUrl.searchParams.set('cid', cid);

  let request: Request;
  if (preset === 'raw') {
    request = new Request(pdsBlobUrl);
  } else {
    const presetConf = presets[preset];

    const url = new URL('/', wsrvUrl);
    url.searchParams.set('url', pdsBlobUrl.toString());
    for (const key of Object.keys(presetConf)) {
      url.searchParams.set(key, presetConf[key].toString());
    }

    request = new Request(url);
  }

  return fetch(request);
};
