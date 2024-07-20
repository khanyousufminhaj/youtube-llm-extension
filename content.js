(function () {
  // Function to check if the URL is a YouTube video page
  function isYouTubeVideoPage() {
    return window.location.href.includes("watch");
  }

  // Function to toggle chat box visibility based on URL
  function toggleChatBoxVisibility() {
    const chatBox = document.getElementById("llm-chat-box");
    if (isYouTubeVideoPage()) {
      chatBox.style.display = "none"; // Initially hide the chat box
    } else {
      chatBox.style.display = "none";
    }
  }

  // HTML structure for the chat box
  const chatBoxHTML = `
      <div id="llm-chat-box" class="llm-chat-box" style="display: none;">
        <div id="llm-chat-header" class="llm-chat-header">
          <span>VidSage</span>
          <button id="llm-chat-minimize" class="llm-chat-minimize">-</button>
        </div>
        <div id="llm-chat-body" class="llm-chat-body"></div>
        <div class="llm-chat-input-container">
          <input id="llm-chat-input" class="llm-chat-input" type="text"/>
          <button id="llm-chat-send" class="llm-chat-send">Send</button>
        </div>
      </div>
    `;

  // Inject the chat box HTML into the document body
  document.body.insertAdjacentHTML("beforeend", chatBoxHTML);

  const chatBox = document.getElementById("llm-chat-box");
  const chatHeader = document.getElementById("llm-chat-header");
  const chatInput = document.getElementById("llm-chat-input");
  const chatBody = document.getElementById("llm-chat-body");

  // Enable dragging the chat box
  let isDragging = false,
    offsetX,
    offsetY;
  chatHeader.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - chatBox.offsetLeft;
    offsetY = e.clientY - chatBox.offsetTop;
    chatHeader.style.cursor = "grabbing";
  });
  document.addEventListener("mouseup", () => {
    isDragging = false;
    chatHeader.style.cursor = "grab";
  });
  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      chatBox.style.left = `${e.clientX - offsetX}px`;
      chatBox.style.top = `${e.clientY - offsetY}px`;
    }
  });

  // Minimize chat box
  document.getElementById("llm-chat-minimize").addEventListener("click", () => {
    chatBox.style.display = "none";
  });

  // Send user query and display response
  document.getElementById("llm-chat-send").addEventListener("click", () => {
    const userQuery = chatInput.value.trim();
    if (userQuery) {
      chatBody.insertAdjacentHTML(
        "beforeend",
        `<div class="user-query chat-bubble">${userQuery}</div>`
      );
      chatBody.scrollTop = chatBody.scrollHeight; // Scroll to bottom

      chrome.runtime.sendMessage(
        { action: "fetchLLMResponse", query: userQuery },
        (response) => {
          const message = response.error
            ? `Error: ${response.error}`
            : response.text;
          chatBody.insertAdjacentHTML(
            "beforeend",
            `<div class="llm-response chat-bubble">${message}</div>`
          );
          chatInput.value = "";
          chatBody.scrollTop = chatBody.scrollHeight; // Scroll to bottom
        }
      );
    }
  });

  // Inject chat button into YouTube controls
  function injectChatButton() {
    const controls = document.querySelector(".ytp-right-controls");
    if (controls) {
      const chatButton = document.createElement("button");
      chatButton.id = "llm-chat-toggle";
      chatButton.className = "ytp-subtitles-button ytp-button";
      chatButton.ariaLabel = "Chat";
      chatButton.style.width = "48px";
      chatButton.style.height = "48px";
      chatButton.style.cursor = "pointer";
      //SVG Element creation style (referenced from youtube captions button)
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("version", "1.0");
        svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        svg.setAttribute("width", "34.56pt");
        svg.setAttribute("height", "34.56pt");
        svg.setAttribute("viewBox", "0 0 34.56 34.56");
        svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

        // Create the metadata element
        const metadata = document.createElementNS("http://www.w3.org/2000/svg", "metadata");
        metadata.textContent = "Created by potrace 1.16, written by Peter Selinger 2001-2019";
        svg.appendChild(metadata);

        // Create the group element
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("transform", "translate(0.000000,34.560000) scale(0.072000,-0.072000)");
        g.setAttribute("fill", "#fff");
        g.setAttribute("stroke", "none");

        // Create the path element
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", "M132 328 c-8 -8 -12 -47 -12 -111 0 -99 0 -99 23 -92 12 4 58 10 103 14 105 8 114 16 114 98 0 100 -3 103 -118 103 -63 0 -102 -4 -110 -12z m187-32 c7 -8 11 -36 9 -63 l-3 -48 -85 0 -85 0 -3 48 c-2 27 2 55 9 63 16 20 142 20 158 0z");
        g.appendChild(path);

        // Append the group to the SVG
        svg.appendChild(g);

      chatButton.appendChild(svg);
      

      chatButton.addEventListener("click", () => {
        chatBox.style.display =
          chatBox.style.display === "none" ? "flex" : "none";
      });
      controls.insertBefore(chatButton, controls.firstChild);
    }
  }

  // Observe for YouTube controls to inject the chat button
  const observer = new MutationObserver(() => {
    if (document.querySelector(".ytp-right-controls")) {
      injectChatButton();
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Monitor URL changes to hide/show chat box
  new MutationObserver(() => {
    const currentUrl = window.location.href;
    if (!currentUrl.includes("youtube.com/watch?v=")) {
      toggleChatBoxVisibility();
    }
  }).observe(document.body, { childList: true, subtree: true });

  // Initial check to set chat box visibility
  toggleChatBoxVisibility();
})();
