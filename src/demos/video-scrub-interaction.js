/** @param {HTMLElement} root @param {string} [inlineVideo] */
export function createVideoScrubber(root, inlineVideo) {
  const stage = root.querySelector('[data-video-scrub]');
  const video = stage.querySelector('video');
  const frameLabel = stage.querySelector('[data-video-frame]');
  const status = stage.querySelector('[data-video-status]');
  const frameRate = 24;
  const frameCount = 72;
  let displayed = 0;
  let desired = 0;
  let pending = null;
  let frame = 0;
  let failed = false;

  function fail() {
    failed = true;
    cancelAnimationFrame(frame);
    stage.dataset.videoState = 'error';
    status.textContent = '视频无法加载。可以查看下方或右侧的三个关键帧。';
    status.hidden = false;
  }

  function reveal() {
    if (failed || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
    stage.dataset.videoState = 'ready';
    status.hidden = true;
  }

  function seek() {
    if (failed || video.readyState < HTMLMediaElement.HAVE_METADATA || video.seeking || pending !== null || frame || desired === displayed) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (failed || video.seeking || desired === displayed) return;
      // Use the middle of the frame's interval, even for the final frame.
      const time = (desired + 0.5) / frameRate;
      const { seekable } = video;
      let available = false;
      for (let index = 0; index < seekable.length; index += 1) {
        if (seekable.start(index) <= time && time <= seekable.end(index)) {
          available = true;
          break;
        }
      }
      if (!available) return;
      pending = desired;
      try {
        video.currentTime = time;
      } catch {
        fail();
      }
    });
  }

  stage.dataset.videoState = 'loading';
  status.textContent = '正在加载视频…';
  status.hidden = false;
  video.addEventListener('loadedmetadata', seek);
  video.addEventListener('progress', seek);
  video.addEventListener('loadeddata', () => {
    reveal();
    seek();
  });
  video.addEventListener('seeked', () => {
    if (failed) return;
    if (pending !== null) {
      displayed = pending;
      pending = null;
      frameLabel.textContent = `${String(displayed + 1).padStart(2, '0')} / ${frameCount} 帧`;
    }
    reveal();
    seek();
  });
  video.addEventListener('error', fail);

  if (inlineVideo) {
    try {
      const bytes = Uint8Array.from(atob(inlineVideo.split(',')[1]), (character) => character.charCodeAt(0));
      video.src = URL.createObjectURL(new Blob([bytes], { type: 'video/mp4' }));
    } catch {
      fail();
    }
  } else {
    const load = () => { video.src = video.dataset.videoSrc; };
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        if (!failed) load();
      }, { rootMargin: '320px 0px' });
      observer.observe(stage);
    } else {
      load();
    }
  }

  return (progress) => {
    desired = Math.round(Math.max(0, Math.min(1, progress)) * (frameCount - 1));
    seek();
  };
}
