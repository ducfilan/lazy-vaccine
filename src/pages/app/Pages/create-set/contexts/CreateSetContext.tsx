import { SetInfo } from "@/common/types/types"
import { createContext, useContext } from "react"

export type Context = {
  currentStep: number
  setCurrentStep: (currentStep: number) => void
  setInfo?: SetInfo
  setSetInfo: (setInfo: SetInfo) => void
}

export const CreateSetContext = createContext<Context>({
  currentStep: -1,
  setCurrentStep: () => {},
  setInfo: undefined,
  setSetInfo: () => {},
})

export const useCreateSetContext = () => useContext(CreateSetContext)
