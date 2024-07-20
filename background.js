chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fetchLLMResponse") {
    fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=API_key', {//append api key here
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "system_instruction": { "parts": { "text": "You are an AI Youtube Assistant named Vidsage created by Yousuf.You will provide helpful answer to user queries.Mae sure to format the replies properly." } },
        "contents": [{ "parts": [{ "text": "User query goes here: " + request.query }]}]
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.candidates && data.candidates.length > 0) {
        sendResponse({text: data.candidates[0].content.parts[0].text});
      } else {
        sendResponse({error: 'No response from LLM'});
      }
    })
    .catch(error => {
      console.error('Error:', error);
      sendResponse({error: 'Error fetching LLM response'});
    });

    return true; // Will respond asynchronously.
  }
});
