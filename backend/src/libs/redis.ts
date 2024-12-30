import { createClient, RedisClientType } from 'redis';
import AppError from '../errors/AppError';
import { logger } from '../utils/logger';

let redis: any | null = null;


export const initRedis = async () => {
    if (redis) return redis;

    const redisClient = createClient({
        url: 'redis://localhost:6379',
    });


    try {
        await redisClient.connect();
        redis = redisClient;
        logger.info('Conexão com Redis estabelecida com sucesso!');
    } catch (error) {
        console.error('Erro ao conectar com Redis:', error);
        throw new AppError('Falha ao conectar com Redis');
    }

    return redis;
};


export const getRedis = () => {
    if (redis == null) {
        throw new AppError("Redis não inicializado");
    }
    return redis;
};
