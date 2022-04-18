import { createContext, useContext } from "react"
import { User } from "@/common/types/types"

type Context = {
  user?: User
  onTabChanged: (selectedTab: string) => void
}

export const UserProfileContext = createContext<Context>({
  user: undefined,
  onTabChanged: () => {},
})

export const useUserProfileContext = () => useContext(UserProfileContext)
