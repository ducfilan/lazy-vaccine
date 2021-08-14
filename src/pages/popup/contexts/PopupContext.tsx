import { createContext, useContext } from "react"
import { Language, User } from "@/common/types/types"

export type Context = {
  selectedLanguages: Language[]
  setSelectedLanguages: (languages: Language[]) => void
  user: User | null
  setUser: (user: User | null) => void
}

export const PopupContext = createContext<Context>({
  selectedLanguages: [],
  setSelectedLanguages: () => {},
  user: null,
  setUser: () => {},
})

export const usePopupContext = () => useContext(PopupContext)
