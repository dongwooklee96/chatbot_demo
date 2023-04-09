import type {NextApiRequest, NextApiResponse} from 'next';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
    });

    const sendData = (data: string) => {
        res.write(`${data}`);
    };

    try {
        sendData(JSON.stringify( `pong`)); // works
    } catch (error) {
        console.log('error', error);
    } finally {
        //sendData('[DONE]');
        res.end();
    }
}
