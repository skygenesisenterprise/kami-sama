"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
  Subtitles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"

interface VideoPlayerProps {
  poster?: string
  title?: string
  onPrevious?: () => void
  onNext?: () => void
  hasPrevious?: boolean
  hasNext?: boolean
}

export function VideoPlayer({ poster, title, onPrevious, onNext, hasPrevious, hasNext }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [quality, setQuality] = useState("1080p")
  const [playbackSpeed, setPlaybackSpeed] = useState("1")
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()

  // Simulated duration for demo
  useEffect(() => {
    setDuration(24 * 60) // 24 minutes in seconds
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleMuteToggle = () => {
    setIsMuted(!isMuted)
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
    setIsMuted(value[0] === 0)
  }

  const handleSeek = (value: number[]) => {
    setCurrentTime(value[0])
  }

  const handleFullscreen = useCallback(() => {
    if (!containerRef.current) return

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  const handleMouseMove = useCallback(() => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
  }, [isPlaying])

  // Simulate playback
  useEffect(() => {
    if (isPlaying && currentTime < duration) {
      const interval = setInterval(() => {
        setCurrentTime((prev) => Math.min(prev + 1, duration))
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isPlaying, currentTime, duration])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case " ":
          e.preventDefault()
          handlePlayPause()
          break
        case "ArrowLeft":
          setCurrentTime((prev) => Math.max(prev - 10, 0))
          break
        case "ArrowRight":
          setCurrentTime((prev) => Math.min(prev + 10, duration))
          break
        case "f":
          handleFullscreen()
          break
        case "m":
          handleMuteToggle()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [duration, handleFullscreen])

  return (
    <div
      ref={containerRef}
      className={cn("relative bg-black aspect-video rounded-xl overflow-hidden group", isFullscreen && "rounded-none")}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video placeholder / Poster */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: poster ? `url(${poster})` : undefined }}
      >
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <button
              onClick={handlePlayPause}
              className="h-20 w-20 rounded-full bg-primary flex items-center justify-center hover:scale-105 transition-transform"
            >
              <Play className="h-8 w-8 text-primary-foreground ml-1" fill="currentColor" />
            </button>
          </div>
        )}
      </div>

      {/* Controls overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50 transition-opacity duration-300",
          showControls || !isPlaying ? "opacity-100" : "opacity-0",
        )}
      >
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 p-4">
          <h3 className="text-lg font-medium truncate">{title}</h3>
        </div>

        {/* Center controls */}
        <div className="absolute inset-0 flex items-center justify-center gap-8">
          {hasPrevious && (
            <button
              onClick={onPrevious}
              className="h-12 w-12 rounded-full bg-background/30 backdrop-blur-sm flex items-center justify-center hover:bg-background/50 transition-colors"
            >
              <SkipBack className="h-6 w-6" />
            </button>
          )}

          <button
            onClick={handlePlayPause}
            className="h-16 w-16 rounded-full bg-primary flex items-center justify-center hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <Pause className="h-7 w-7 text-primary-foreground" fill="currentColor" />
            ) : (
              <Play className="h-7 w-7 text-primary-foreground ml-1" fill="currentColor" />
            )}
          </button>

          {hasNext && (
            <button
              onClick={onNext}
              className="h-12 w-12 rounded-full bg-background/30 backdrop-blur-sm flex items-center justify-center hover:bg-background/50 transition-colors"
            >
              <SkipForward className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium w-12">{formatTime(currentTime)}</span>
            <Slider
              value={[currentTime]}
              max={duration}
              step={1}
              onValueChange={handleSeek}
              className="flex-1 cursor-pointer"
            />
            <span className="text-sm font-medium w-12 text-right">{formatTime(duration)}</span>
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={handlePlayPause} className="p-2 hover:bg-secondary rounded-lg transition-colors">
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>

              {/* Volume */}
              <div className="flex items-center gap-2 group/volume">
                <button onClick={handleMuteToggle} className="p-2 hover:bg-secondary rounded-lg transition-colors">
                  {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                  className="w-0 group-hover/volume:w-24 transition-all duration-300 cursor-pointer"
                />
              </div>

              {/* Time display */}
              <span className="text-sm text-muted-foreground ml-2">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {/* Subtitles */}
              <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                <Subtitles className="h-5 w-5" />
              </button>

              {/* Settings */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                    <Settings className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Qualité: {quality}</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuRadioGroup value={quality} onValueChange={setQuality}>
                        <DropdownMenuRadioItem value="1080p">1080p</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="720p">720p</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="480p">480p</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="360p">360p</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Vitesse: {playbackSpeed}x</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuRadioGroup value={playbackSpeed} onValueChange={setPlaybackSpeed}>
                        <DropdownMenuRadioItem value="0.5">0.5x</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="0.75">0.75x</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="1">Normal</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="1.25">1.25x</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="1.5">1.5x</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="2">2x</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Fullscreen */}
              <button onClick={handleFullscreen} className="p-2 hover:bg-secondary rounded-lg transition-colors">
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
