import { NftInfo } from "@/common/types/types"
import { NftTokenAccount } from "@nfteyez/sol-rayz-react"
import { createContext, useContext } from "react"

type Context = {
  nfts: NftTokenAccount[]
  setNfts: (nfts: NftTokenAccount[]) => void
  walletPublicKey: string
  setWalletPublicKey: (walletPublicKey: string) => void
  selectedNftInfo: NftInfo | null
  setSelectedNftInfo: (selectedNftInfo: NftInfo | null) => void
}

export const MarketPlaceContext = createContext<Context>({
  nfts: [],
  setNfts: () => {},
  walletPublicKey: "",
  setWalletPublicKey: () => {},
  selectedNftInfo: null,
  setSelectedNftInfo: () => {},
})

export const useMarketPlaceContext = () => useContext(MarketPlaceContext)
