import { describe, expect, it } from 'vitest';
import { Connection, PublicKey } from '@solana/web3.js';

// Exercise web3.js's real HTTP JSON-RPC serialization through the jayson
// override, without public RPC access or mocking the Connection implementation.
describe('Solana JSON-RPC dependency compatibility', () => {
  it('serializes requests and decodes results using the upgraded client', async () => {
    const requests: Record<string, unknown>[] = [];
    const connection = new Connection('http://127.0.0.1:8899', {
      fetch: async (_url, options): Promise<Response> => {
        const request = JSON.parse(String(options?.body));
        requests.push(request);
        return new Response(JSON.stringify({
          jsonrpc: '2.0', id: request.id,
          result: { context: { slot: 42 }, value: 123456789 },
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      },
    });
    const address = new PublicKey('11111111111111111111111111111111');
    expect(await connection.getBalance(address, 'confirmed')).toBe(123456789);
    expect(requests[0]).toMatchObject({
      jsonrpc: '2.0', method: 'getBalance',
      params: [address.toBase58(), { commitment: 'confirmed' }],
    });
    expect(typeof requests[0].id).toBe('string');
  });

  it('preserves JSON-RPC error handling', async () => {
    const connection = new Connection('http://127.0.0.1:8899', {
      fetch: async (_url, options): Promise<Response> => {
        const request = JSON.parse(String(options?.body));
        return new Response(JSON.stringify({
          jsonrpc: '2.0', id: request.id,
          error: { code: -32602, message: 'Invalid params' },
        }), { status: 200 });
      },
    });
    await expect(connection.getBalance(new PublicKey('11111111111111111111111111111111')))
      .rejects.toThrow('Invalid params');
  });
});
