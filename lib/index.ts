import { IncomingMessage, request as httpRequest } from 'http';
import { request as httpsRequest } from 'https';
import { HttpError, IRemoteTransport, NetworkError } from '@myrotvorets/facex-base';

export class TransportRequest implements IRemoteTransport {
    // eslint-disable-next-line class-methods-use-this
    public post(url: URL, body: string, headers: Record<string, string>, timeout: number): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let responseBody = '';
            let tid: NodeJS.Timeout | undefined = undefined;
            const request = url.protocol === 'https:' ? httpsRequest : httpRequest;
            headers['Content-Length'] = `${body.length}`;

            const req = request(
                url,
                {
                    method: 'POST',
                    headers,
                },
                (response: IncomingMessage) => {
                    response.on('data', (chunk) => {
                        responseBody += chunk;
                    });

                    response.once('end', () => {
                        clearTimeout(tid);
                        if (response.statusCode !== 200) {
                            const error = new HttpError({
                                status: response.statusCode || 0,
                                statusText: response.statusMessage || '',
                            });

                            error.body = responseBody;
                            reject(error);
                        } else {
                            resolve(responseBody);
                        }
                    });
                },
            );

            req.once('error', (error) => {
                clearTimeout(tid);
                const e = new NetworkError(error.message);
                e.stack = error.stack;
                e.body = responseBody;
                reject(e);
            });

            tid = setTimeout((): unknown => req.destroy(new NetworkError('Timeout')), timeout);
            req.write(body);
            req.end();
        });
    }
}
