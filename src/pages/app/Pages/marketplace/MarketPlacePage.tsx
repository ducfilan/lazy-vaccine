import { i18n } from "@/common/consts/constants"
import { WalletKitProvider } from "@gokiprotocol/walletkit"
import React, { useState } from "react"
import GettingStarted from "./sub-pages/GettingStarted"
import { MarketPlaceContext } from "./contexts/MarketplaceContext"
import { NftTokenAccount } from "@nfteyez/sol-rayz-react"
import GrowingNfts from "./sub-pages/GrowingNfts"
import { NftInfo } from "@/common/types/types"
import NftDetail from "./sub-pages/NftDetail"

const MarketPlacePage = () => {
  const [nfts, setNfts] = useState<NftTokenAccount[]>([])
  const [walletPublicKey, setWalletPublicKey] = useState<string>("")
  const [selectedNftInfo, setSelectedNftInfo] = useState<NftInfo | null>(null)

  function renderPages() {
    if (!nfts.length) {
      return <GettingStarted />
    }

    if (selectedNftInfo) {
      return <NftDetail />
    }

    return <GrowingNfts />
  }

  return (
    <WalletKitProvider
      defaultNetwork="devnet"
      app={{
        name: i18n("appName"),
      }}
    >
      <MarketPlaceContext.Provider
        value={{ nfts, setNfts, walletPublicKey, setWalletPublicKey, selectedNftInfo, setSelectedNftInfo }}
      >
        {renderPages()}
      </MarketPlaceContext.Provider>
    </WalletKitProvider>
  )
}

export default MarketPlacePage
