import { createContext, useContext } from "react"
import { Language } from "@/common/types/types"

export type Context = {
  selectedLanguages: Language[]
  setSelectedLanguages: (languages: Language[]) => void
}

export const PopupContext = createContext<Context>({
  selectedLanguages: [],
  setSelectedLanguages: () => {},
})

export const usePopupContext = () => useContext(PopupContext)
