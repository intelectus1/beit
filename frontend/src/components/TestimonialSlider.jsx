import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { cn } from '../lib/utils'

export function TestimonialSlider({ reviews, className }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState('right')

  const activeReview = reviews[currentIndex]

  const handleNext = () => {
    setDirection('right')
    setCurrentIndex((prev) => (prev + 1) % reviews.length)
  }

  const handlePrev = () => {
    setDirection('left')
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length)
  }

  const handleThumbnailClick = (index) => {
    setDirection(index > currentIndex ? 'right' : 'left')
    setCurrentIndex(index)
  }

  const thumbnailReviews = reviews.filter((_, i) => i !== currentIndex).slice(0, 3)

  const imageVariants = {
    enter: (dir) => ({ y: dir === 'right' ? '100%' : '-100%', opacity: 0 }),
    center: { y: 0, opacity: 1 },
    exit: (dir) => ({ y: dir === 'right' ? '-100%' : '100%', opacity: 0 }),
  }

  const textVariants = {
    enter: (dir) => ({ x: dir === 'right' ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir === 'right' ? -50 : 50, opacity: 0 }),
  }

  return (
    <div
      className={cn(
        'relative w-full min-h-[620px] md:min-h-[540px] overflow-hidden bg-zinc-900 border border-zinc-800 rounded-2xl text-white p-8 md:p-12',
        className
      )}
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-full">
        {/* Left: counter + thumbnails */}
        <div className="md:col-span-3 flex flex-col justify-between order-2 md:order-1">
          <div className="flex flex-row md:flex-col justify-between md:justify-start space-x-4 md:space-x-0 md:space-y-4">
            <span className="text-sm text-zinc-500 font-mono">
              {String(currentIndex + 1).padStart(2, '0')} /{' '}
              {String(reviews.length).padStart(2, '0')}
            </span>
            <h2 className="text-sm font-medium tracking-widest uppercase text-zinc-500 [writing-mode:vertical-rl] md:rotate-180 hidden md:block">
              Testimonios
            </h2>
          </div>

          <div className="flex space-x-2 mt-8 md:mt-0">
            {thumbnailReviews.map((review) => {
              const originalIndex = reviews.findIndex((r) => r.id === review.id)
              return (
                <button
                  key={review.id}
                  onClick={() => handleThumbnailClick(originalIndex)}
                  className="overflow-hidden rounded-lg w-16 h-20 md:w-20 md:h-24 opacity-40 hover:opacity-90 transition-opacity duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
                  aria-label={`Ver testimonio de ${review.name}`}
                >
                  <img src={review.thumbnailSrc} alt={review.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                </button>
              )
            })}
          </div>
        </div>

        {/* Center: main image */}
        <div className="md:col-span-4 relative h-64 min-h-[360px] md:min-h-[460px] order-1 md:order-2">
          <AnimatePresence initial={false} custom={direction}>
            <motion.img
              key={currentIndex}
              src={activeReview.imageSrc}
              alt={activeReview.name}
              custom={direction}
              variants={imageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-0 w-full h-full object-cover rounded-xl"
              loading="lazy"
              decoding="async"
            />
          </AnimatePresence>
        </div>

        {/* Right: quote + navigation */}
        <div className="md:col-span-5 flex flex-col justify-between md:pl-8 order-3">
          <div className="relative overflow-hidden pt-4 md:pt-12 min-h-[160px]">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={textVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              >
                <p className="text-sm font-medium text-zinc-400">{activeReview.affiliation}</p>
                <h3 className="text-xl font-semibold mt-1 text-white">{activeReview.name}</h3>
                <blockquote className="mt-5 text-xl md:text-2xl font-medium leading-snug text-white/85">
                  "{activeReview.quote}"
                </blockquote>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center space-x-2 mt-8 md:mt-0">
            <button
              onClick={handlePrev}
              aria-label="Testimonio anterior"
              className="w-12 h-12 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Siguiente testimonio"
              className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white hover:bg-indigo-600 transition-all"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
