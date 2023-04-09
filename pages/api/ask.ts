import type {NextApiRequest, NextApiResponse} from 'next';
import {OpenAIEmbeddings} from 'langchain/embeddings';
import {PineconeStore} from 'langchain/vectorstores';
import {makeChain} from '@/utils/makechain';
import {pinecone} from '@/utils/pinecone-client';
import {PINECONE_INDEX_NAME, PINECONE_NAME_SPACE} from '@/config/pinecone';
import {v4 as uuidv4} from "uuid";
import redis from "@/utils/redis";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  //const { question, history } = req.body;
  const history = req.query.history;
  const question = req.query.question;
  // console.log('history:', history);
  // console.log('question', question);

  if (!question) {
    return res.status(400).json({ message: 'No question in the request' });
  }
  // OpenAI recommends replacing newlines with spaces for best results
  const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

  const index = pinecone.Index(PINECONE_INDEX_NAME);

  /* create vectorstore*/
  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings({}),
    {
      pineconeIndex: index,
      textKey: 'text',
      namespace: PINECONE_NAME_SPACE,
    },
  );

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
  });

  const sendData = (data: string) => {
    res.write(`${data}`);
    // res.write(`data: ${data}\n\n`);
  };

//   sendData(JSON.stringify({ data: '' }));

  //create chain
  const chain = makeChain(vectorStore, (token: string) => {
    //sendData(JSON.stringify({ data: token }));
  });

  try {
    //Ask a question
    const response = await chain.call({
      question: sanitizedQuestion,
      chat_history: history || [],
    });

    const obj = response;
    const text = obj['text'];

    const uuid = uuidv4();
    redis.set(uuid, text);

    // response.uuid = uuid
    console.log('uuid', uuid);
    console.log('response', response);
    //console.log('response', response["response"]);
    //sendData(response.response)
     sendData(JSON.stringify({ response, uuid })); // works
    // sendData(JSON.stringify({ sourceDocs: response.sourceDocuments }));
  } catch (error) {
    console.log('error', error);
  } finally {
    //sendData('[DONE]');
    res.end();
  }
}
