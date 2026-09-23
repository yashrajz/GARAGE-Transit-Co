import React, { useEffect, useRef, useState } from 'react'

interface RevealProps {
  children: React.ReactNode
  delay?: 0 | 1 | 2 | 3
  className?: string
  as?: 'div' | 'section' | 'article'
}

/** Scroll-triggered rise-in. Falls back to visible when IO is unavailable. */
export default function Reveal({ children, delay = 0, className = '', as = 'div' }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [seen, setSeen] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setSeen(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setSeen(true)
            io.disconnect()
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const Tag = as as 'div'
  return (
    <Tag ref={ref} className={`${seen ? (delay === 0 ? 'reveal' : `reveal-${delay}`) : 'opacity-0'} ${className}`}>
      {children}
    </Tag>
  )
}
