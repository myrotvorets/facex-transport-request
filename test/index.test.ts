import * as fetch from 'node-fetch';
import { FaceXError, HttpError, NetworkError } from '@myrotvorets/facex-base';
import { TransportFetch } from '../lib';

jest.mock('node-fetch');

const {
    FetchError,
    Response,
}: { FetchError: typeof fetch.FetchError; Response: typeof fetch.Response } = jest.requireActual('node-fetch');

const mockedFetch = fetch as jest.Mocked<typeof fetch>;

describe('TransportFetch', () => {
    const transport = new TransportFetch();

    it('should throw NetworkError on fetch error', () => {
        const r = new FetchError('message', 'type');
        mockedFetch.default.mockRejectedValue(r);

        return expect(transport.post(new URL('http://example.com/'), '', {})).rejects.toThrow(NetworkError);
    });

    it('should throw HttpError on HTTP error (1)', () => {
        const r = new Response('Ignored', { status: 404, statusText: 'Not Found' });
        mockedFetch.default.mockResolvedValue(r);

        return expect(transport.post(new URL('http://example.com/'), '', {})).rejects.toThrow(HttpError);
    });

    it('should throw HttpError on HTTP error (2)', () => {
        const r = new Response('Ignored', { status: 404, statusText: 'Not Found' });
        mockedFetch.default.mockResolvedValue(r);

        return expect(transport.post(new URL('http://example.com/'), '', {})).rejects.toMatchObject({
            code: 404,
            statusText: 'Not Found',
            body: 'Ignored',
        });
    });

    it('should tolerate errors in text() in HttpError handler', () => {
        const r = new Response('Ignored', { status: 400, statusText: 'Bad, Bad Request' });
        r.text = jest.fn().mockRejectedValue(new Error('Unknown error'));
        mockedFetch.default.mockResolvedValue(r);

        return expect(transport.post(new URL('http://example.com/'), '', {})).rejects.toMatchObject({
            code: 400,
            statusText: 'Bad, Bad Request',
            body: '',
        });
    });

    it('should throw FaceXError on any other error', () => {
        const r = new Response('Ignored', { status: 200, statusText: 'OK' });
        r.text = jest.fn().mockRejectedValue(new Error('Unknown error'));
        mockedFetch.default.mockResolvedValue(r);

        return expect(transport.post(new URL('http://example.com/'), '', {})).rejects.toThrow(FaceXError);
    });
});
