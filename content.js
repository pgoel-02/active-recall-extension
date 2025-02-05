function sendVideoUrlToReact(iframe) {
  const videoUrl = window.location.href;
  iframe.onload = () => {
    console.log("sending");
    iframe.contentWindow.postMessage({ type: "videoUrl", videoUrl }, "*");
  };
}

function sendVideoUrlToReact(iframe) {
  setInterval(() => {
    const videoUrl = window.location.href;
    iframe.contentWindow.postMessage({ type: "videoUrl", videoUrl }, "*");
  }, 1000);
}

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

function isAdPlaying() {
  const adOverlay = document.querySelector(".ytp-ad-player-overlay-layout");
  return adOverlay !== null;
}

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

function hideIframe(iframe) {
  iframe.style.position = "absolute";
  iframe.style.left = "-900000px";
}

function showIframe(iframe) {
  iframe.style.position = "fixed";
  iframe.style.left = "75%";
}

const handlePauses = (event) => {
  const iframe = document.querySelector("iframe[src='http://localhost:5173']");

  if (event.data.type === "APP_IS_NULL") {
    const videoElement = document.querySelector("video");
    if (videoElement && videoElement.paused) {
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

const IFRAME_STYLES = {
  position: "fixed",
  top: "0",
  left: "75%",
  transform: "translateX(-50%)",
  width: "34%",
  height: "25%",
  zIndex: "999999",
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.5)",
};

let iframeTriggered = false;
let currentUrl = window.location.href;

window.addEventListener("message", handlePauses);

setInterval(() => {
  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href;
    iframeTriggered = false;
  } else if (!iframeTriggered) {
    triggerIframePipeline();
  }
}, 500);
