import {OpenAIChat} from 'langchain/llms';
import {ChatVectorDBQAChain, LLMChain, loadQAChain} from 'langchain/chains';
import {PineconeStore} from 'langchain/vectorstores';
import {CallbackManager} from 'langchain/callbacks';
import {
    CONDENSE_PROMPT,
    SHELDON_PROMPT,

} from "@/utils/prompt/prompt";
import {BasePromptTemplate} from "langchain";

export const makeChain = (
  vectorstore: PineconeStore,
  onTokenStream?: (token: string) => void,
  prompt?: BasePromptTemplate,
) => {
  const questionGenerator = new LLMChain({
    llm: new OpenAIChat({ temperature: 0 }),
    prompt: CONDENSE_PROMPT,
  });
  const docChain = loadQAChain(
    new OpenAIChat({
      temperature: 0,
      modelName: 'gpt-3.5-turbo', //change this to older versions (e.g. gpt-3.5-turbo) if you don't have access to gpt-4
      streaming: Boolean(onTokenStream),
      callbackManager: onTokenStream
        ? CallbackManager.fromHandlers({
            async handleLLMNewToken(token: string) {
              onTokenStream(token);
              console.log(token);
            },
          })
        : undefined,
    }),
    { prompt: prompt },
  );

  return new ChatVectorDBQAChain({
    vectorstore,
    combineDocumentsChain: docChain,
    questionGeneratorChain: questionGenerator,
    returnSourceDocuments: true,
    k: 2, //number of source documents to return
  });
};
