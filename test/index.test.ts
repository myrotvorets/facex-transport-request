import nock, { disableNetConnect, enableNetConnect } from 'nock';
import { HttpError, NetworkError } from '@myrotvorets/facex-base';
import { TransportRequest } from '../lib';

describe('TransportRequest', () => {
    const transport = new TransportRequest();

    beforeAll(() => disableNetConnect());
    afterAll(() => enableNetConnect());

    it('should throw NetworkError on fetch error', () => {
        nock('http://example.com').post('/').replyWithError('message');
        return expect(transport.post(new URL('http://example.com/'), '', {}, 15000)).rejects.toThrow(NetworkError);
    });

    it('should throw HttpError on HTTP error (1)', () => {
        nock('http://example.com').post('/').reply(404, 'Ignored');
        return expect(transport.post(new URL('http://example.com/'), '', {}, 15000)).rejects.toThrow(HttpError);
    });

    it('should throw HttpError on HTTP error (2)', () => {
        nock('http://example.com').post('/').reply(404, 'Ignored');
        return expect(transport.post(new URL('http://example.com/'), '', {}, 15000)).rejects.toMatchObject({
            code: 404,
            statusText: '',
            body: 'Ignored',
        });
    });

    it('should return body on success', () => {
        const body = 'Response body';
        nock('https://example.com').post('/').reply(200, body);
        return expect(transport.post(new URL('https://example.com/'), '', {}, 15000)).resolves.toEqual(body);
    });

    // see https://github.com/nock/nock/issues/2478
    it.skip('should handle timeouts', () => {
        nock('https://example.com').post('/').delayBody(1000).reply(200, 'XXX');
        return expect(transport.post(new URL('https://example.com/'), '', {}, 50)).rejects.toThrow(NetworkError);
    });
});
