import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { X } from 'lucide-react';
import pb from '@/services/pocketbase';

// Helper function to dynamically load a script into the document
const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    // Check if the script already exists to avoid duplicates
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Script load error for ${src}`));
    document.body.appendChild(script);
  });
};

// Helper function to dynamically load a CSS file into the document head
const loadCss = (href) => {
  if (document.querySelector(`link[href="${href}"]`)) {
    return;
  }
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
};

/**
 * A React component that wraps the Video.js player.
 * It handles dynamic source loading from PocketBase, HLS quality selection,
 * and view count tracking.
 *
 * @param {object} props - The component props.
 * @param {object} props.movie - The movie object containing details like folder_name and id.
 * @param {function} props.onClose - A callback function to close the player.
 */
const VideoPlayer = ({ movie, onClose }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  // Effect to load external Video.js plugins and their CSS
  useEffect(() => {
    loadCss('https://cdn.jsdelivr.net/npm/videojs-hls-quality-selector@1.1.4/dist/videojs-hls-quality-selector.css');
    loadScript('https://cdn.jsdelivr.net/npm/jb-videojs-hls-quality-selector@2.0.2/dist/jb-videojs-hls-quality-selector.min.js')
      .catch(error => console.error("Failed to load Video.js HLS Quality Selector:", error));
  }, []);

  // Main effect for initializing and cleaning up the Video.js player
  useEffect(() => {
    // Ensure the video element is available and Video.js is loaded
    if (!videoRef.current || typeof window.videojs === 'undefined') {
      return;
    }

    let player;
    let viewCountTimer = null;
    let viewCountUpdated = false;

    // Asynchronously initialize the player
    const initializePlayer = async () => {
      try {
        // 1. Fetch streaming settings from PocketBase
        const settingsData = await pb.collection('settings').getList(1, 1);
        if (settingsData.items.length === 0) throw new Error('Streaming settings not found in PocketBase.');
        const settings = settingsData.items[0];

        // 2. Construct the HLS stream URL
        const streamUrl = `${settings.publicStreamUrl}/stream/${movie.folder_name}/master.m3u8`;

        // 3. Define Video.js options
        const videoJsOptions = {
          autoplay: true,
          controls: true,
          responsive: true,
          fill: true,
          sources: [{ src: streamUrl, type: 'application/x-mpegURL' }],
          html5: {
            vhs: {
              overrideNative: true,
              enableLowInitialPlaylist: true,
            },
          },
        };

        // 4. Initialize the player
        player = videojs(videoRef.current, videoJsOptions, () => {
          console.log('Video.js player is ready.');
        });
        playerRef.current = player;

        // 5. Initialize HLS quality selector plugin
        if (player.hlsQualitySelector) {
            player.hlsQualitySelector({ displayCurrentQuality: true });
        }

        // 6. View tracking logic
        const startViewCountTimer = () => {
          if (viewCountUpdated || viewCountTimer) return;
          console.log('[Player] Starting 15-second view count timer.');
          viewCountTimer = setTimeout(() => {
            if (!viewCountUpdated) {
              viewCountUpdated = true;
              pb.collection('media').update(movie.id, { 'played+': 1 })
                .then(() => console.log(`[Player] Updated view count for "${movie.title}".`))
                .catch(err => console.error("Failed to update view count:", err));
            }
          }, 15000); // 15 seconds
        };

        const clearViewCountTimer = () => {
          if (viewCountTimer) {
            clearTimeout(viewCountTimer);
            viewCountTimer = null;
            console.log('[Player] View count timer cleared.');
          }
        };

        // 7. Add event listeners for view tracking
        player.on('play', startViewCountTimer);
        player.on('pause', clearViewCountTimer);
        player.on('ended', clearViewCountTimer);
        player.on('error', (e) => {
            console.error('Video.js Error:', player.error());
            clearViewCountTimer();
        });

      } catch (error) {
        console.error("Failed to initialize player:", error);
      }
    };

    initializePlayer();

    // 8. Cleanup function to run when the component unmounts
    return () => {
      const currentPlayer = playerRef.current;
      if (currentPlayer && !currentPlayer.isDisposed()) {
        console.log('Disposing Video.js player.');
        currentPlayer.dispose();
        playerRef.current = null;
      }
    };
  }, [movie]); // Re-run the effect if the `movie` prop changes

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group">
      <div data-vjs-player>
        <video ref={videoRef} className="video-js vjs-big-play-centered w-full h-full" />
      </div>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 text-white bg-black/50 rounded-full p-2 hover:bg-white/30 transition-colors"
        aria-label="Close player"
      >
        <X className="w-6 h-6" />
      </button>
    </div>
  );
};

export default VideoPlayer;
