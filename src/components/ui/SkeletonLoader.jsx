import { classNames } from '../../utils/helpers'

function Skeleton({ className = '' }) {
  return (
    <div className={classNames(
      'bg-navy-800 rounded-lg animate-skeleton',
      className
    )} />
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-navy-900 border border-navy-700 rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
    </div>
  )
}

export function PostSkeleton() {
  return (
    <div className="bg-navy-900 border border-navy-700 rounded-2xl p-5 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-5 w-12 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>
  )
}

export default Skeleton
