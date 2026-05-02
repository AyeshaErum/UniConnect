// Reusable framer-motion variants

export const fadeUp = {
  initial:   { opacity: 0, y: 16 },
  animate:   { opacity: 1, y: 0 },
  exit:      { opacity: 0, y: -8 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
}

export const fadeIn = {
  initial:   { opacity: 0 },
  animate:   { opacity: 1 },
  exit:      { opacity: 0 },
  transition: { duration: 0.25 },
}

export const scaleIn = {
  initial:   { opacity: 0, scale: 0.95 },
  animate:   { opacity: 1, scale: 1 },
  exit:      { opacity: 0, scale: 0.97 },
  transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
}

export const slideLeft = {
  initial:   { opacity: 0, x: 20 },
  animate:   { opacity: 1, x: 0 },
  exit:      { opacity: 0, x: -20 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
}

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06 } },
}

export const staggerItem = {
  initial:   { opacity: 0, y: 12 },
  animate:   { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
}

export const cardHover = {
  rest:  { y: 0,  boxShadow: '0 4px 32px -8px rgba(0,0,0,0.4)' },
  hover: { y: -4, boxShadow: '0 12px 40px -8px rgba(0,0,0,0.5)', transition: { duration: 0.2, ease: 'easeOut' } },
}

export const pageTransition = {
  initial:   { opacity: 0, y: 10 },
  animate:   { opacity: 1, y: 0 },
  exit:      { opacity: 0, y: -6 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
}
