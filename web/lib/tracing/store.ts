import { create } from 'zustand'

interface TracingState {
  traces: any[]
  getTraces: () => void
}

const useTracingStore = create<TracingState>()((set) => ({
  traces: [],
  getTraces: async () => {
    const traces = await getTraces()
    set({ traces })
  },
}))

export default useTracingStore