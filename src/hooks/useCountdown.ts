import { useState, useEffect } from 'react'

export function useCountdown(initialSeconds: number, onExpire?: () => void) {
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (!isActive || secondsRemaining <= 0) {
      if (isActive && secondsRemaining <= 0 && onExpire) {
        onExpire()
      }
      return
    }

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1))
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, secondsRemaining, onExpire])

  return {
    secondsRemaining,
    setSecondsRemaining,
    isActive,
    start: () => setIsActive(true),
    pause: () => setIsActive(false),
    reset: (seconds: number = initialSeconds) => {
      setIsActive(false)
      setSecondsRemaining(seconds)
    },
  }
}
