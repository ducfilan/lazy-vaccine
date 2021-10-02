import * as React from "react"

import { getSetInfo } from "@/common/api/set"
import { useGlobalContext } from "@/common/contexts/GlobalContext"
import { SetInfo } from "@/common/types/types"
import { HomeContext } from "./contexts/HomeContext"
import { notification, Skeleton } from "antd"

import TopSets from "./components/TopSets"

const { useState, useEffect } = React

const HomePage = (props: any) => {
  const { http } = useGlobalContext()
  const [setInfo, setSetInfo] = useState<SetInfo>()
  const [loading, setLoading] = useState<boolean>(true)

  function onPageLoaded() {
    if (!http) return
  }

  useEffect(onPageLoaded, [http])
  useEffect(() => setInfo && setLoading(false), [setInfo])

  return (
    <HomeContext.Provider value={{ setInfo }}>
      <Skeleton active loading={loading}>
        <TopSets innerContent={""} />
      </Skeleton>
    </HomeContext.Provider>
  )
}

export default HomePage
