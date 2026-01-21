import { client } from "../config/redis"; // your default export client

export const meKey = (userId: string) => `me:${userId}`;
export const authKey = (userId: string) => `auth:${userId}`;

export async function cacheGetJSON<T>(key: string): Promise<T | null> {
    try {
      const raw = await client.get(key);
      if (!raw) return null;
  
      try {
        return JSON.parse(raw) as T;
      } catch (parseErr) {
        console.error("Redis cache JSON parse failed:", parseErr);
        try { await client.del(key); } catch {}
        return null;
      }
    } catch (redisErr) {
      console.error("Redis cache GET failed:", redisErr);
      return null;
    }
}
  

export async function cacheSetJSON(
    key: string,
    value: any,
    ttlSec: number
): Promise<void> {
    if (ttlSec <= 0) return;
    try {
        await client.set(key, JSON.stringify(value), { EX: ttlSec });
    } catch (error) {
        console.error("Redis cacheSetJSON failed:", error);
        // cache is optional
    }
}

export async function cacheDel(key: string) {
    try { 
        await client.del(key); 
    } catch(error) {
        console.error("Deletion from Redis cache failed:", error);
    }
}
