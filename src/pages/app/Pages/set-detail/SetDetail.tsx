import React from "react"
import { useParams } from "react-router-dom"

import { getSetInfo } from "@/common/repo/set"
import { useGlobalContext } from "@/common/contexts/GlobalContext"
import { SetInfo } from "@/common/types/types"
import Header from "./components/Header"
import Interactions from "./components/Interactions"
import Items from "./components/Items"
import { SetDetailContext } from "./contexts/SetDetailContext"
import { notification, Skeleton } from "antd"
import { i18n } from "@/common/consts/constants"
import LearningActivities from "./components/LearningActivities"
import { TrackingNameOpenSetDetailPage } from "@/common/consts/trackingNames"
import { track } from "@amplitude/analytics-browser"

const { useState, useEffect } = React

const SetDetailPage = () => {
  const { http } = useGlobalContext()
  const [setInfo, setSetInfo] = useState<SetInfo>()
  const [loading, setLoading] = useState<boolean>(true)

  let { setId } = useParams()

  function onPageLoaded() {
    if (!http) return

    getSetInfo(http, setId!)
      .then(setSetInfo)
      .catch((error) => {
        console.error(error)

        notification["error"]({
          message: i18n("error"),
          description: i18n("unexpected_error_message"),
          duration: null,
        })
      })
  }

  useEffect(() => {
    track(TrackingNameOpenSetDetailPage)
  }, [])

  useEffect(onPageLoaded, [http])
  useEffect(() => setInfo && setLoading(false), [setInfo])

  return (
    <SetDetailContext.Provider value={{ setInfo }}>
      <Skeleton active loading={loading}>
        <Header />
        <Interactions />
        <LearningActivities />
        <Items />
      </Skeleton>
    </SetDetailContext.Provider>
  )
}

export default SetDetailPage
