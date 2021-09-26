import * as React from "react"

import { getSetInfo } from "@/common/api/set"
import { useGlobalContext } from "@/common/contexts/GlobalContext"
import { SetInfo } from "@/common/types/types"
import Header from "./components/Header"
import Interactions from "./components/Interactions"
import Items from "./components/Items"
import { SetDetailContext } from "./contexts/SetDetailContext"

const { useState, useEffect } = React

const SetDetailPage = (props: any) => {
  const { http } = useGlobalContext()
  const [setInfo, setSetInfo] = useState<SetInfo>()

  function onPageLoaded() {
    if (!http) return

    getSetInfo(http, props.match.params.setId).then(setSetInfo).catch()
  }

  useEffect(onPageLoaded, [http])

  return (
    <SetDetailContext.Provider value={{ setInfo }}>
      <Header />
      <Interactions />
      <Items />
    </SetDetailContext.Provider>
  )
}

export default SetDetailPage
