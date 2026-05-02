import { useState, useEffect, useRef } from 'react'

export function useRealtime(subscribeFunc, deps = []) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const unsubRef = useRef(null)

  useEffect(() => {
    setLoading(true)
    unsubRef.current = subscribeFunc(result => {
      setData(result)
      setLoading(false)
    })
    return () => {
      if (unsubRef.current) unsubRef.current()
    }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading }
}
