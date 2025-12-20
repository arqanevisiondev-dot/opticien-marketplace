import React from 'react'

type Props = React.PropsWithChildren<{
  className?: string
}>

export function Alert({ children, className = '' }: Props) {
  return (
    <div className={`rounded-md bg-amber-50 border border-amber-100 p-3 ${className}`}>{children}</div>
  )
}

export function AlertDescription({ children, className = '' }: Props) {
  return <div className={`text-sm text-amber-700 ${className}`}>{children}</div>
}

export default Alert
