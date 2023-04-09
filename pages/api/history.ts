import type {NextApiRequest, NextApiResponse} from 'next';
import redis from "@/utils/redis";


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const { question_id } = req.body;
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
    });

    const sendData = (data: string) => {
        res.write(`${data}`);
    };

    try {
        const response = await redis.get(question_id);
        sendData(JSON.stringify({ response })); // works
    } catch (error) {
        console.log('error', error);
    } finally {
        //sendData('[DONE]');
        res.end();
    }
}
