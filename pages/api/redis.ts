import type {NextApiRequest, NextApiResponse} from 'next';
import redis from "@/utils/redis";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const { question, history } = req.body;

    const count = await redis.incr('counter')
    res.status(200).json({ count })
}
