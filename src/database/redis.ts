import { createClient } from "redis";

const redis = createClient({
    password: process.env.REDIS_USER_PASSWORD,
    socket: {
        host: process.env.REDIS_SOCKET_HOST_URL,
        port: Number(process.env.REDIS_SOCKET_HOST_PORT)
    }
});
(async () => {
    redis.on("error", err => console.log("REDIS ERROR", err));
    redis.on("connect", () => console.log("Redis Database Connected"));
    await redis.connect();
})();

const RedisRanking = createClient({
  password: process.env.REDIS_RANKING_PASSWORD,
  socket: {
    host: process.env.REDIS_RANKING_HOST_URL,
    port: Number(process.env.REDIS_RANKING_HOST_PORT)
  }
});
(async () => {
  RedisRanking.on("connect", () => console.log("Redis Ranking Connected"));
  await RedisRanking.connect();
})();

const RedisUsers = createClient({
    password: process.env.REDIS_USER_CACHE_PASSWORD,
    socket: {
        host: process.env.REDIS_USER_CACHE_HOST_URL,
        port: Number(process.env.REDIS_USER_CACHE_HOST_PORT)
    }
});
(async () => {
    RedisUsers.on("error", err => console.log("REDIS USER ERROR", err));
    redis.on("connect", () => console.log("Redis User Connected"));
    await RedisUsers.connect();
})();

export { RedisRanking, RedisUsers, redis }