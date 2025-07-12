import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { moviesAPI, episodesAPI } from '@/services/pocketbase'; // Import APIs for played_count

/**
 * A React component that wraps the Video.js player.
 * It now uses a dynamic stream URL passed via props.
 *
 * @param {object} props - The component props.
 * @param {object} props.movie - The content object (movie or episode) with a `streamUrl` property.
 * @param {function} props.onClose - A callback function to close the player.
 */
const VideoPlayer = ({ movie, onClose }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);

  useEffect(() => {
    // Exit early if the video element isn't ready or if we don't have a stream URL
    if (!videoRef.current || !movie || !movie.streamUrl) {
      return;
    }

    const videoJsOptions = {
      autoplay: true,
      controls: true,
      responsive: true,
      fill: true,
      sources: [{
        src: movie.streamUrl, // MODIFIED: Use the dynamic URL from the movie prop
        type: 'application/x-mpegURL'
      }],
      html5: {
        vhs: {
          overrideNative: true,
          enableLowInitialPlaylist: true,
        },
      },
    };

    // Initialize the player
    const player = videojs(videoRef.current, videoJsOptions, function() {
      console.log('Video.js player is ready.');
      if (this.hlsQualitySelector) {
        this.hlsQualitySelector({ displayCurrentQuality: true });
      }
    });

    playerRef.current = player;
    
    // --- Played Count Tracking ---
    let viewCountTimer = null;
    let viewCountUpdated = false;

    const startViewCountTimer = () => {
      if (viewCountUpdated || viewCountTimer) return;
      
      viewCountTimer = setTimeout(() => {
        if (!viewCountUpdated) {
          viewCountUpdated = true;
          if (movie && movie.id && movie.type) {
            // Determine which API to use based on content type
            const api = movie.type === 'movie' ? moviesAPI : episodesAPI;
            api.incrementPlayCount(movie.id)
              .then(() => console.log(`[Player] Updated view count for "${movie.title}".`))
              .catch(err => console.error("Failed to update view count:", err));
          }
        }
      }, 15000); // 15 seconds
    };

    const clearViewCountTimer = () => {
      if (viewCountTimer) clearTimeout(viewCountTimer);
    };

    player.on('play', startViewCountTimer);
    player.on('pause', clearViewCountTimer);
    player.on('ended', clearViewCountTimer);

    // --- Keyboard Shortcuts ---
    const handleKeyDown = (event) => {
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;
      if (!playerRef.current) return;
      
      switch (event.code) {
        case 'Space':
          event.preventDefault();
          if (player.paused()) player.play(); else player.pause();
          break;
        case 'ArrowRight':
          player.currentTime(player.currentTime() + 10);
          break;
        case 'ArrowLeft':
          player.currentTime(player.currentTime() - 10);
          break;
        case 'ArrowUp':
          player.volume(Math.min(player.volume() + 0.1, 1));
          break;
        case 'ArrowDown':
          player.volume(Math.max(player.volume() - 0.1, 0));
          break;
        default: break;
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    // --- Error Handling ---
    player.on('error', () => {
      console.error('Video.js Error:', player.error());
      clearViewCountTimer();
    });

    // --- Cleanup ---
    return () => {
      clearViewCountTimer();
      document.removeEventListener('keydown', handleKeyDown);
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [movie]); // Re-run the effect if the `movie` object (and its streamUrl) changes

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group">
      <div data-vjs-player ref={playerContainerRef}>
        <video ref={videoRef} className="video-js vjs-big-play-centered w-full h-full" />
      </div>
    </div>
  );
};

export default VideoPlayer;
