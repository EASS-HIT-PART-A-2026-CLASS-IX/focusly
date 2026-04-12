import { createContext, useContext, useState } from 'react'

interface TaskCountCtx {
  count: number
  setCount: (n: number) => void
}

const TaskCountContext = createContext<TaskCountCtx>({ count: 0, setCount: () => {} })

export function TaskCountProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0)
  return (
    <TaskCountContext.Provider value={{ count, setCount }}>
      {children}
    </TaskCountContext.Provider>
  )
}

export function useTaskCount() {
  return useContext(TaskCountContext)
}
