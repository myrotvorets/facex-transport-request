import fetch, { Response } from 'node-fetch';
import { IRemoteTransport, FaceXError, HttpError, NetworkError } from '@myrotvorets/facex-base';

export class TransportFetch implements IRemoteTransport {
    public async post(url: URL, body: string, headers: Record<string, string>): Promise<string> {
        const r = await this._fetch(url, body, headers);

        if (!r.ok) {
            const err = new HttpError(r);
            try {
                err.body = await r.text();
            } catch (e) {
                err.body = '';
            }

            throw err;
        }

        return this._getText(r);
    }

    private _fetch(url: URL, body: string, headers: Record<string, string>): Promise<Response> {
        return fetch(url, { method: 'POST', body, headers }).catch((e: Error) =>
            Promise.reject(new NetworkError(e.message)),
        );
    }

    private _getText(r: Response): Promise<string> {
        return r.text().catch((e: Error) => Promise.reject(new FaceXError(e.message)));
    }
}
