import { createClient } from "redis";

export const client = createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_URI,
        port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : undefined
    }
});

client.on("error", (err) => {
    console.error("❌ Redis Client Error:", err);
});
  
// Fires when the client is fully ready to use
client.on("ready", () => {
    console.log("✅ Redis connected and ready");
});
  
// fires when TCP connection is established
client.on("connect", () => {
  console.log("🔌 Redis socket connected");
});

client.on("reconnecting", () => console.log("♻️ Redis reconnecting..."));

client.on("end", () => console.log("🛑 Redis connection ended"));

export async function connectRedis() {
  if (!client.isOpen) await client.connect();
}