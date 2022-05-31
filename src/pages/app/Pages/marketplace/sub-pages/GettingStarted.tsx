import React, { useCallback } from "react"

import { Row } from "antd"
import { ConnectWalletButton, useConnectedWallet, useSolana } from "@gokiprotocol/walletkit"
import { TreeGrow } from "../components/TreeGrow"
import SpotlightTitle from "../components/SpotlightTitle"
import TextCard from "@/pages/app/components/TextCard"
import SmokingPipeImg from "@img/ui/others/smoking pipes.jpg"
import { useWalletNfts } from "@nfteyez/sol-rayz-react"
import { useMarketPlaceContext } from "../contexts/MarketplaceContext"

const { useEffect } = React

const GettingStarted = () => {
  const { providerMut } = useSolana()
  const wallet = useConnectedWallet()

  const { setNfts, setWalletPublicKey } = useMarketPlaceContext()

  const { nfts, isLoading, error } = useWalletNfts({
    publicAddress: wallet?.publicKey.toBase58() || "",
    connection: providerMut?.connection,
  })

  const refetchWalletInfo = useCallback(async () => {
    if (wallet) {
      setWalletPublicKey(wallet.publicKey.toString())
    }
  }, [wallet])

  useEffect(() => {
    void refetchWalletInfo()
  }, [refetchWalletInfo])

  useEffect(() => {
    if (!isLoading || error) {
      return
    }

    setNfts(nfts)
  }, [nfts])

  return (
    <>
      <Row>
        <TextCard imgUrl={SmokingPipeImg}>
          <p>
            In the world, large cities with thousands of industrial enterprises are expanding. As a result of their
            work, substances <b className="highlight">that poison the air that we breathe and our children</b>, the
            water we drink and the land on which we grow our food are released.{" "}
            <b className="highlight">Forests are rapidly being cut down</b> or killed as a result of large-scale fires.
            If nothing is done, then <b className="highlight">one day we will have nothing to breathe</b>.
          </p>
        </TextCard>
      </Row>
      <TreeGrow height={500} />
      <SpotlightTitle />

      <Row className="getting-started--info-wrapper">
        <p>
          By growing trees along with growing your knowledge on Lazy Vaccine, we will grow a{" "}
          <b className="highlight">real tree on Earth</b>. More than that, you will earn{" "}
          <b className="highlight">credits</b> for your efforts. Connect to your wallet and start growing trees by
          selecting the seeds you want.
        </p>
        <p>
          Be the <b className="highlight">Superman</b> and save the world!
        </p>
        <div className="getting-started--connect-btn">
          <ConnectWalletButton />
        </div>
      </Row>
    </>
  )
}

export default GettingStarted
