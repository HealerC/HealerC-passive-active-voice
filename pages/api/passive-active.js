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

  const request = JSON.parse(req.body);
  let textList = request.textList;
  let detectOption = request.detectOption;
  console.log(textList, detectOption);
  if (!textList) {
    res.status(400).json({
      error: {
        message: "Please enter a valid text",
      },
    });
    return;
  }

  try {
    const completionList = await getPromises(textList);
    const result = parseOutput(completionList);
    console.log(result);
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

function getPromises(textList) {
  return Promise.all(
    textList.map((text) => {
      return openai.createCompletion({
        model: "text-davinci-003",
        prompt: generatePrompt(text),
        temperature: 0,
        max_tokens: 200,
      });
    })
  );
}

function parseOutput(completionList) {
  return completionList.map((completion) => {
    const textResult = completion.data.choices[0].text;
    console.log(textResult);
    const hyphenIndex = textResult.indexOf("-");
    if (hyphenIndex) {
      const voice = textResult.slice(0, hyphenIndex).trim();
      const result = textResult.slice(hyphenIndex + 1).trim();
      return { voice, result };
    } else {
      return { voice: "", textResult };
    }
  });
}

function generatePrompt(text) {
  return `
    You will be given a sentence. It may be in the active or passive voice. 
    If the sentence is in the active voice, convert it to the passive voice 
    starting the sentence with 'Passive-' while if it is in the passive voice 
    convert it to active voice starting with 'Active-'. If a conversion cannot 
    be done, leave the sentence as it is starting with 'Same-' 
          
    Input: The boy kicked the ball.
    Output: Passive-The ball was kicked by the boy.
    Input: ${text}
    Output:`;
}

// Each sentence separated by a . is either in the active or passive voice. Detect the voice and Convert each of them to their
//     corresponding opposite voice still separated by . but they should start with Active, Passive or Same depending on the voice they were
//     converted to and a hyphen like so

// function generatePrompt(text) {
//   return `Each sentence separated by a . is either in the active or passive voice. Convert each of them to their
//   opposite and they should start with the voice they are converted to and a hyphen. If conversion isn't possible leave it
//   as is and prepend Same-

//     Input: The boy kicked the ball. Thomas was bullied by his friends. Jesus wept.
//     Output: Passive-The ball was kicked by the boy. Active-Thomas's friends bullied him. Same-Jesus wept.
//     Input: The ball was caught by the outfielder. The chef cooked the meal to perfection. The package was delivered to the wrong address.
//     Output: Active-The outfielder caught the ball. Passive-The meal was cooked to perfection by the chef. Active-The delivery person delivered the package to the wrong address.
//     Input: ${text}

//     Output:`;
// }

// You will be given a sentence. It may be in the active or passive voice. If the sentence is in the active voice, convert it to the passive voice starting the sentence with 'Passive-' while
// if it is in the passive voice convert it to active voice starting with 'Active-'. If a conversion cannot be done, leave the sentence as it is starting with 'Same-'

// Input: The boy kicked the ball.
// Output: Passive-The ball was kicked by the boy.
// Input: The package was delivered to the wrong address.
// Output: Active-Someone delivered the package to the wrong address.

// return `You are given sentences as Input separated by . These sentences may be in the
// active voice or passive voice. In the Output If the sentences are in the active voice,
// convert it to the passive voice starting the sentence with 'Passive-' while
// if it is in the passive voice convert it to active voice starting the sentence
// with 'Active-'. If a conversion cannot be done, leave it as is starting the
// sentence with 'Same-'

//     Input: The boy kicked the ball. Thomas was bullied by his friends.
//     Output: Passive-The ball was kicked by the boy. Active-Thomas's friends bullied him.
//     Input: ${text}
//     Output:`;
