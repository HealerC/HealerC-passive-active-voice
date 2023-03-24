import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message:
          "OpenAI API key not configured, please follow instructions in README.md",
      },
    });
    return;
  }

  const { text } = JSON.parse(req.body);

  if (!text) {
    res.status(400).json({
      error: {
        message: "Please enter a valid text",
      },
    });
    return;
  }

  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: generatePrompt(text),
      temperature: 0,
      max_tokens: 200,
    });
    const result = parseOutput(completion);
    res.status(200).json(result);
  } catch (error) {
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: "An error occurred during your request.",
        },
      });
    }
  }
}

function parseOutput(completion) {
  const result = completion.data.choices[0].text;
  if (result.includes("null")) {
    return {
      phrase: "This sentence does not contain a passive voice",
      suggestions: [],
    };
  }
  const colonIndex = result.indexOf(":");
  if (colonIndex < 0) {
    return {
      phrase: "An unexpected error occured",
      suggestions: [],
    };
  }
  const phrase = result.slice(0, colonIndex).trim();
  const suggestions = result.slice(colonIndex + 1).split(",");
  return { phrase, suggestions };
}

function generatePrompt(text) {
  return `
  You will be given a sentence. If it has a passive voice, 
  then the phrase in the sentence that makes the sentence 
  have a passive voice should be highlighted followed by a colon, 
  followed by suggestions to convert the sentence to the active voice 
  separated by commas. 
  If the sentence does not have a passive voice, the output should be null.
          
  Input: The meal was cooked to perfection by the chef.
  Output: was cooked:The chef cooked the meal to perfection,The meal that the chef cooked was perfect
  Input: The delivery person delivered the package to the wrong address.
  Output: null
  Input: ${text}
  Output:
`;
}
