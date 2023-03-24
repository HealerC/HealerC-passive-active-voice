import { useState } from "react";

const defaultState = {
  text: "",
};

export default function CheckForPassive() {
  const [inputData, setInputData] = useState(defaultState);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setInputData({ ...inputData, [name]: value });
  }
  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/passive", {
        method: "POST",
        heeaders: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inputData),
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
  }

  return (
    <div className="w-1/2 mx-auto p-3">
      <h1 className="text-lg font-bold">Check For Passive Voice</h1>
      <p>App prototype for Richie</p>
      <p className="text-blue-500 font-medium italic">
        Type in a sentence to highlight the 'passive voice' in it.
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="text"
          value={inputData.text}
          onChange={handleChange}
          className="border border-blue-400 block w-full p-2"
        />
        <button
          type="submit"
          className="mt-2 bg-blue-700 rounded-md p-2 text-white hover:bg-blue-600 active:bg-blue-800"
        >
          Submit
        </button>
      </form>
      <section>
        {result && (
          <div className="bg-green-200 border border-green-400 p-2 mt-2 rounded-lg">
            {result.phrase ===
            "This sentence does not contain a passive voice" ? (
              <p>{result.phrase}</p>
            ) : (
              <div>
                <p>
                  The passive voice: <b>{result.phrase}</b>
                </p>
                {result.suggestions?.length >= 0 && (
                  <ul>
                    <p className="mt-2">
                      Suggestions to rewrite the text in the active voice
                    </p>
                    {result.suggestions.map((suggestion) => (
                      <li key={suggestion}>
                        {">>"}
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
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
