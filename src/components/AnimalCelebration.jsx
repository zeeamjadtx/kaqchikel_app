import { useEffect, useState } from 'react'
import { getAnimalDanceClass } from '../utils/animalCelebration'

/**
 * Full-screen celebration reward (animals or fruits).
 * Only shows when the PNG loads — see public/animals/ and public/fruits/
 */
export default function AnimalCelebration({ visible, animal }) {
  const [imageSrc, setImageSrc] = useState(null)

  useEffect(() => {
    if (!visible || !animal) {
      setImageSrc(null)
      return
    }

    let cancelled = false
    const tryLoad = (src, nextFallback) => {
      const img = new Image()
      img.onload = () => {
        if (!cancelled) setImageSrc(src)
      }
      img.onerror = () => {
        if (!cancelled) {
          if (nextFallback) tryLoad(nextFallback, null)
          else setImageSrc(null)
        }
      }
      img.src = src
    }

    tryLoad(animal.imageSrc, animal.fallbackSrc || null)
    return () => {
      cancelled = true
    }
  }, [visible, animal])

  if (!visible || !animal || !imageSrc) return null

  const danceClass = getAnimalDanceClass(animal.animation)

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none p-4"
      role="status"
      aria-live="polite"
    >
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-4 border-amber-300 px-8 py-6 max-w-sm text-center">
        <div className={`${danceClass} inline-block`}>
          <img
            src={imageSrc}
            alt=""
            width={200}
            height={200}
            className="w-44 h-44 md:w-52 md:h-52 object-contain drop-shadow-lg mx-auto"
            draggable={false}
          />
        </div>
        <p className="mt-3 text-lg font-bold text-amber-900">{animal.label || '¡Término especial!'}</p>
        <p className="text-sm text-amber-800/90">¡Sigue así!</p>
      </div>
    </div>
  )
}
