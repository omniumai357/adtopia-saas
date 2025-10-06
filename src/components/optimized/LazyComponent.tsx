// Lazy loading component wrapper
import { Suspense, lazy, ComponentType } from 'react'

interface LazyComponentProps {
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function LazyComponent({ 
  fallback = <div className="animate-pulse bg-gray-200 h-32 rounded" />, 
  children 
}: LazyComponentProps) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  )
}

// Higher-order component for lazy loading
export function withLazyLoading<T extends object>(
  Component: ComponentType<T>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(() => Promise.resolve({ default: Component }))
  
  return function WrappedComponent(props: T) {
    return (
      <Suspense fallback={fallback || <div className="animate-pulse bg-gray-200 h-32 rounded" />}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}

// Lazy load heavy components
export const LazyGallery = lazy(() => import('./Gallery'))
export const LazyPricing = lazy(() => import('./Pricing'))
export const LazyContact = lazy(() => import('./Contact'))
