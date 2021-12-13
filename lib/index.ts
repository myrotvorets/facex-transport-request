import { Response, fetch } from 'fetch-h2';
import { FaceXError, HttpError, IRemoteTransport, NetworkError } from '@myrotvorets/facex-base';

export class TransportFetch implements IRemoteTransport {
    // eslint-disable-next-line class-methods-use-this
    public async post(url: URL, body: string, headers: Record<string, string>): Promise<string> {
        const r = await TransportFetch._fetch(url, body, headers);

        if (!r.ok) {
            const err = new HttpError(r);
            try {
                err.body = await r.text();
            } catch (e) {
                err.body = '';
            }

            throw err;
        }

        return TransportFetch._getText(r);
    }

    private static _fetch(url: URL, body: string, headers: Record<string, string>): Promise<Response> {
        return fetch(url.toString(), { method: 'POST', body, headers }).catch((e: Error) => {
            throw new NetworkError(e.message);
        });
    }

    private static _getText(r: Response): Promise<string> {
        return r.text().catch((e: Error) => {
            throw new FaceXError(e.message);
        });
    }
}
