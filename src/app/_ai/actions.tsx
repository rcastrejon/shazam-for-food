"use server";

import { streamObject } from "ai";
import { createStreamableUI } from "ai/rsc";
import { ollama } from "ollama-ai-provider";
import { z } from "zod";

function Thinking({ thoughts }: { thoughts: string | undefined }) {
  if (thoughts) {
    return <div className="text-muted-foreground">{thoughts}</div>;
  }
  return <div className="text-muted-foreground">Thinking...</div>;
}

export async function streamComponent({ image }: { image: string }) {
  "use server";

  const stream = createStreamableUI(<Thinking thoughts={undefined} />);

  void (async () => {
    const { partialObjectStream } = await streamObject({
      model: ollama("llava-phi3"), // TODO: Change to the final model
      system: `
You have perfect vision and pay great attention to detail which makes you an \
expert at identifying ingredients in food. You are tasked with figuring out \
the exact ingredients shown in the picture and give the dish an appropriate \
name.`,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", image },
            {
              type: "text",
              text: `
Tell me with certainty what ingredients are in the dish. To improve your \
chances of figuring out the right ingredients, you will display a list of \
words for the ingredients that you are not completely certain, sort of like a \
word cloud. Then, I will select the words that correspond to the dish. The \
idea is that you only list words that will help you identify the dish, so I \
can discard the irrelevant words. Before providing the answer in 'words' \
field, think step-by-step in 'thinking' field and analyze every part of the \
image.`,
            },
          ],
        },
      ],
      schema: z.object({
        thinking: z.string(),
        words: z.array(z.string()),
      }),
    });

    for await (const partialObject of partialObjectStream) {
      if (!partialObject.words) {
        stream.update(<Thinking thoughts={partialObject.thinking} />);
        continue;
      }
      stream.update(
        <div>
          {partialObject.words.map((word, i) => (
            <div key={i}>{word}</div>
          ))}
        </div>,
      );
    }

    stream.done();
  })();

  return stream.value;
}
