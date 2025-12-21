import React, { createContext, useContext, useState } from "react"

type SelectContextType = { value?: string; onChange?: (v: string) => void }
const SelectContext = createContext<SelectContextType>({})

export const Select: React.FC<any> = ({ value, onValueChange, children }) => {
  const [open, setOpen] = useState(false)

  return (
    <SelectContext.Provider value={{ value, onChange: onValueChange }}>
      <div className="relative inline-block">{children}</div>
    </SelectContext.Provider>
  )
}

export const SelectTrigger: React.FC<any> = ({ children, className = "" }) => {
  const ctx = useContext(SelectContext)
  return (
    <button type="button" className={`border rounded px-2 py-1 ${className}`}>
      {children ?? ctx.value}
    </button>
  )
}

export const SelectValue: React.FC<any> = ({ children }) => {
  const ctx = useContext(SelectContext)
  return <span>{children ?? ctx.value}</span>
}

export const SelectContent: React.FC<any> = ({ children, className = "" }) => {
  return <div className={`mt-1 bg-white border rounded ${className}`}>{children}</div>
}

export const SelectItem: React.FC<{ value: string; children?: React.ReactNode }> = ({ value, children }) => {
  const ctx = useContext(SelectContext)
  return (
    <div
      role="option"
      onClick={() => ctx.onChange && ctx.onChange(value)}
      className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
    >
      {children}
    </div>
  )
}

export default Select
