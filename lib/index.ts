import { type IncomingMessage, request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { HttpError, type IRemoteTransport, NetworkError } from '@myrotvorets/facex-base';

export class TransportRequest implements IRemoteTransport {
    public post(url: URL, body: string, headers: Record<string, string>, timeout: number): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let responseBody = '';
            const request = url.protocol === 'https:' ? httpsRequest : httpRequest;
            headers['Content-Length'] = `${body.length}`;

            const errorHandler = (error: Error): void => {
                const e = new NetworkError(error.message, { cause: error });
                e.body = responseBody;
                reject(e);
            };

            const req = request(
                url,
                {
                    method: 'POST',
                    headers,
                    signal: AbortSignal.timeout(timeout),
                },
                (response: IncomingMessage) => {
                    response.on('data', (chunk) => {
                        responseBody += chunk as string;
                    });

                    response.once('end', () => {
                        if (response.statusCode !== 200) {
                            const error = new HttpError({
                                status: response.statusCode ?? 0,
                                statusText: response.statusMessage ?? '',
                            });

                            error.body = responseBody;
                            reject(error);
                        } else {
                            resolve(responseBody);
                        }
                    });

                    response.once('error', errorHandler);
                },
            );

            req.once('error', errorHandler);

            req.write(body);
            req.end();
        });
    }
}
