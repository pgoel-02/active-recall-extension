/* This script is injected into the YouTube video's page to handle communication with the React App in the iframe. */

// Sends the current video's URL to the React app in the iframe.
function sendVideoUrlToReact(iframe) {
  setInterval(() => {
    const videoUrl = window.location.href;
    iframe.contentWindow.postMessage({ type: "videoUrl", videoUrl }, "*");
  }, 1000);
}

// Sends the current video time to the React app in the iframe.
function sendVideoTimeToReact(iframe) {
  const video = document.querySelector("video");
  if (video) {
    setInterval(() => {
      const currentTime = video.currentTime;
      iframe.contentWindow.postMessage(
        { type: "currentTime", currentTime },
        "*"
      );
    }, 1000);
  }
}
// Sends the video's duration to the React app in the iframe.
function sendVideoDuration(iframe) {
  const video = document.querySelector("video");
  if (video.duration) {
    setInterval(() => {
      iframe.contentWindow.postMessage(
        { type: "videoDuration", videoDuration: video.duration },
        "*"
      );
    }, 1000);
  }
}

// Checks if an ad is currently playing on the YouTube video.
function isAdPlaying() {
  const adOverlay = document.querySelector(".ytp-ad-player-overlay-layout");
  return adOverlay !== null;
}

// Triggers the iframe pipeline if no ad is playing, adding the iframe to the page and sending messages to the React app needed for question generation.
function triggerIframePipeline() {
  setTimeout(() => {
    if (!iframeTriggered && !isAdPlaying()) {
      iframeTriggered = true;
      const iframe = document.createElement("iframe");
      iframe.src = "http://localhost:5173";
      Object.assign(iframe.style, IFRAME_STYLES);
      document.body.appendChild(iframe);
      sendVideoDuration(iframe);
      sendVideoUrlToReact(iframe);
      sendVideoTimeToReact(iframe);
    }
  }, 1000);
}

// Hides the iframe by moving it off-screen.
function hideIframe(iframe) {
  iframe.style.position = "absolute";
  iframe.style.left = "-900000px";
}

// Shows the iframe by positioning it on the screen.
function showIframe(iframe) {
  iframe.style.position = "fixed";
  iframe.style.left = "75%";
}

// Pauses video when the React App has questions and unpauses the video when the React App is null.
const handlePauses = (event) => {
  const iframe = document.querySelector("iframe[src='http://localhost:5173']");

  if (event.data.type === "APP_IS_NULL") {
    const videoElement = document.querySelector("video");
    if (videoElement && videoElement.paused && !videoElement.ended) {
      hideIframe(iframe);
      videoElement.play();
    }
  }

  if (event.data.type === "APP_IS_NOT_NULL") {
    const videoElement = document.querySelector("video");
    if (videoElement && !videoElement.paused) {
      showIframe(iframe);
      videoElement.pause();
    }
  }
};

// Styles for the iframe.
const IFRAME_STYLES = {
  position: "fixed",
  top: "0",
  left: "75%",
  transform: "translateX(-50%)",
  width: "34%",
  height: "25%",
  zIndex: "999999",
  minWidth: "343px",
  minHeight: "153px",
};

let iframeTriggered = false;
let currentUrl = window.location.href;

// Listens for messages from the React app regarding whether a video should be paused or unpaused, and handles the iframe visibility accordingly.
window.addEventListener("message", handlePauses);

// Checks for URL changes and triggers the iframe pipeline as the user navigates to different videos.
setInterval(() => {
  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href;
    iframeTriggered = false;
  } else if (!iframeTriggered) {
    triggerIframePipeline();
  }
}, 500);
