import { useState } from "react";

const defaultState = {
  text: "",
  detectOption: "detect",
};

export default function PassiveToActive() {
  const [inputData, setInputData] = useState(defaultState);
  const [result, setResult] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setInputData({ ...inputData, [name]: value });
  }
  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    const sentenceList = getEachSentence(inputData.text);
    console.log(sentenceList);

    try {
      const response = await fetch("/api/passive-active", {
        method: "POST",
        heeaders: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          textList: sentenceList,
          detectOption: inputData.detectOption,
        }),
      });
      const result = await response.json();

      if (response.status !== 200) {
        throw (
          result.error ||
          new Error(`Request failed with status ${response.status}`)
        );
      }
      setResult(result);
    } catch (error) {
      console.error(error);
      if (error.message) {
        setError(error.message);
      } else {
        setError(JSON.stringify(error));
      }

      setTimeout(() => {
        setError("");
      }, 5000);
    } finally {
      setLoading(false);
    }

    return;
  }

  function getEachSentence(userInput) {
    return userInput
      .split(".")
      .filter((sentence) => sentence !== "")
      .map((sentence) => sentence.trim());
  }

  function parseResult(apiResult) {
    console.log("result", apiResult);
    const parsed = apiResult.split(". ").map((result) => {
      console.log(result);
      const hyphen = result.indexOf("-");
      return [result.slice(0, hyphen), result.slice(hyphen + 1)];
    });
    return parsed;
  }

  return (
    <div className="w-1/2 mx-auto p-3">
      <h1 className="text-lg font-bold">ChatGPT Passive Voice Checker</h1>
      <p>Simple app to convert between active and passive voice</p>
      <p>
        Separate the sentences to detect with <b>.</b>
      </p>
      <form onSubmit={handleSubmit}>
        <select
          name="detectOption"
          value={inputData.option}
          onChange={(e) => e.target.value}
        >
          <option value="detect">Detect (default)</option>
          <option value="active-to-passive">Active to passive</option>
          <option value="passive-to-active">Passive to active</option>
        </select>
        <textarea
          name="text"
          value={inputData.text}
          onChange={handleChange}
          className="border border-blue-400 block w-full h-40 p-2"
          maxLength={150}
        />
        <button
          type="submit"
          className="mt-2 bg-blue-700 rounded-md p-2 text-white hover:bg-blue-600 active:bg-blue-800"
        >
          Submit
        </button>
      </form>
      <section>
        {result.length && (
          <div className="bg-green-200 border border-green-400 p-2 mt-2 rounded-lg">
            {result.map((sentence) => (
              <div key={sentence[result]} className="flex justify-between mb-2">
                <p>{[sentence["result"]]}</p>
                <p className="uppercase font-medium bg-green-800 text-white p-1 rounded-sm">
                  {sentence["voice"]}
                </p>
              </div>
            ))}
          </div>
        )}
        {loading && (
          <div className="flex justify-center bg-blue-200 border border-blue-400 p-2 mt-2 rounded-lg">
            <p>Loading...</p>
          </div>
        )}
        {error && (
          <div className="flex justify-between bg-red-200 border border-red-400 p-2 mt-2 rounded-lg">
            <p>{error}</p>
          </div>
        )}
      </section>
    </div>
  );
}
