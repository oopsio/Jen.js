import { createClient } from 'redis';

export class RedisCache {
  client = createClient();

  async connect() { await this.client.connect(); }
  async set(key: string, value: any, ttlSec?: number) {
    if(ttlSec) await this.client.setEx(key, ttlSec, JSON.stringify(value));
    else await this.client.set(key, JSON.stringify(value));
  }
  async get(key: string) {
    const val = await this.client.get(key);
    return val ? JSON.parse(val) : null;
  }
  async delete(key: string) { await this.client.del(key); }
}
