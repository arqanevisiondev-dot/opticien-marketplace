import React from 'react'

type Props = React.PropsWithChildren<{
  className?: string
}>

export function Card({ children, className = '' }: Props) {
  return (
    <div className={`rounded-lg bg-white ${className}`}>{children}</div>
  )
}

export function CardHeader({ children, className = '' }: Props) {
  return <div className={`px-4 py-3 ${className}`}>{children}</div>
}

export function CardContent({ children, className = '' }: Props) {
  return <div className={`p-4 ${className}`}>{children}</div>
}

export function CardTitle({ children, className = '' }: Props) {
  return <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
}

export function CardDescription({ children, className = '' }: Props) {
  return <div className={`text-sm text-gray-500 ${className}`}>{children}</div>
}

export default Card
