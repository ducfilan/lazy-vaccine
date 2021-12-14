import * as React from "react"

import { getSetInfo } from "@/common/repo/set"
import { useGlobalContext } from "@/common/contexts/GlobalContext"
import { SetInfo } from "@/common/types/types"
import Header from "./components/Header"
import Interactions from "./components/Interactions"
import Items from "./components/Items"
import { SetDetailContext } from "./contexts/SetDetailContext"
import { notification, Skeleton } from "antd"

const { useState, useEffect } = React

const SetDetailPage = (props: any) => {
  const { http } = useGlobalContext()
  const [setInfo, setSetInfo] = useState<SetInfo>()
  const [loading, setLoading] = useState<boolean>(true)

  function onPageLoaded() {
    if (!http) return

    getSetInfo(http, props.match.params.setId)
      .then(setSetInfo)
      .catch(() => {
        notification["error"]({
          message: chrome.i18n.getMessage("error"),
          description: chrome.i18n.getMessage("unexpected_error_message"),
          duration: null,
        })
      })
  }

  useEffect(onPageLoaded, [http])
  useEffect(() => setInfo && setLoading(false), [setInfo])

  return (
    <SetDetailContext.Provider value={{ setInfo }}>
      <Skeleton active loading={loading}>
        <Header />
        <Interactions />
        <Items />
      </Skeleton>
    </SetDetailContext.Provider>
  )
}

export default SetDetailPage
