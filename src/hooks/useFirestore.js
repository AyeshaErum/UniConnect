import { useState, useEffect } from 'react'
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore'
import { db } from '../firebase/config'

export function useCollection(collectionPath, orderByField = 'createdAt', direction = 'desc') {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!collectionPath) return
    setLoading(true)
    const q = query(
      collection(db, collectionPath),
      orderBy(orderByField, direction)
    )
    const unsub = onSnapshot(
      q,
      snap => {
        setData(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      err => {
        setError(err.message)
        setLoading(false)
      }
    )
    return unsub
  }, [collectionPath, orderByField, direction])

  return { data, loading, error }
}
