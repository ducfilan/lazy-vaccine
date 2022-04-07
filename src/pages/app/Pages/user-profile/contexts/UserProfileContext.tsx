import { createContext, useContext } from "react"
import { User } from "@/common/types/types"

type Context = {
  user?: User
  setSelectedTab: (selectedTab: string) => void
}

export const UserProfileContext = createContext<Context>({
  user: undefined,
  setSelectedTab: () => {},
})

export const useUserProfileContext = () => useContext(UserProfileContext)
