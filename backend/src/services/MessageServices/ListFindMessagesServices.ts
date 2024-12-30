import { QueryTypes } from "sequelize";
import sequelize from "../../database";
import { getRedis } from "../../libs/redis";

interface Request {
    ticketId: string;
    pageNumber?: string;
    searchParam?: string;
}

interface TotalMessages {
    totalmessages: number;
}

interface Response {
    messages?: object[];
    hasMore: boolean;
    count: number;
    countTotalMessages?: number;
    time?: number;
    error?: string;
}

const generateCacheKey = (ticketId: string, searchParam: string, pageNumber: string) => {
    return `messages:${ticketId}:${searchParam}:${pageNumber}`;
};

const ListMessagesService = async ({
    pageNumber = "1",
    ticketId,
    searchParam,
}: Request): Promise<Response> => {

    try {
        const limit = 40;
        const offset = (parseInt(pageNumber, 10) - 1) * limit;

        const cacheKey = generateCacheKey(ticketId, searchParam || '', pageNumber);

        const redis = getRedis()

        const cachedResponse = await redis.get(cacheKey);
        if (cachedResponse) {
            return JSON.parse(cachedResponse);
        }

        const startTime = Date.now();

        const query = `
            SELECT m.id, m.body, m."fromMe", m."createdAt", c.name AS contact_name
            FROM "Messages" m
            LEFT JOIN "Contacts" c ON m."contactId" = c.id
            WHERE m."ticketId" = :ticketId
              AND unaccent(m.body) ILIKE unaccent(:searchParam)
            ORDER BY m."createdAt" DESC
            LIMIT :limit OFFSET :offset;
        `;

        const replacements = {
            ticketId,
            searchParam: `%${searchParam?.trim() || ''}%`,
            limit,
            offset
        };

        const messages = await sequelize.query(query, {
            type: QueryTypes.SELECT,
            replacements: replacements
        });

        // const queryCount = `
        //     SELECT COUNT(*) AS totalMessages
        //     FROM "Messages" m
        //     WHERE m."ticketId" = :ticketId
        //       AND unaccent(m.body) ILIKE unaccent(:searchParam);
        // `;

        // const totalCountResult: TotalMessages[] = await sequelize.query(queryCount, {
        //     type: QueryTypes.SELECT,
        //     replacements: replacements
        // });

        // const countTotalMessages = totalCountResult.length > 0 ? totalCountResult[0].totalmessages : 0;

        const hasMore = messages.length === limit;

        const endTime = Date.now();
        const executionTime = endTime - startTime;

        const response = {
            messages,
            count: messages.length,
            hasMore,
            // countTotalMessages,
            time: executionTime
        };

        await redis.setEx(cacheKey, 100, JSON.stringify(response));

        return response

    } catch (error) {
        console.error("Error occurred while fetching messages:", error);
        return {
            messages: [],
            count: 0,
            countTotalMessages: 0,
            hasMore: false,
            time: 0,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
};

export default ListMessagesService;