import { createContext, useContext } from "react"
import Language from "../types/Language"
export type GlobalContent = {
  selectedLanguages: Language[]
  setSelectedLanguages: (languages: Language[]) => void
}
export const PopupContext = createContext<GlobalContent>({
  selectedLanguages: [],
  setSelectedLanguages: () => {},
})

export const usePopupContext = () => useContext(PopupContext)
