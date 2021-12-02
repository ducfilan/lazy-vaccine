import * as React from "react"
import { Carousel } from "antd"
import { LeftOutlined, RightOutlined } from "@ant-design/icons"

import { useGlobalContext } from "@/common/contexts/GlobalContext"
import { useState } from "react"
import { SetInfo } from "@/common/types/types"
import useLocalStorage from "@/common/hooks/useLocalStorage"
import CacheKeys from "@/common/consts/cacheKeys"
import { getTopSets } from "@/common/api/set"
import TopSetItem from "./TopSetItem"

const i18n = chrome.i18n.getMessage

const { useEffect } = React

const TopSets = () => {
  const { user, http } = useGlobalContext()
  const [cachedTopSets, setCachedTopSets] = useLocalStorage<SetInfo[]>(CacheKeys.topSets, [], "1d")
  const [topSets, setTopSets] = useState<SetInfo[]>([])

  useEffect(() => {
    if (!http || !user) return

    if (cachedTopSets) {
      setTopSets(cachedTopSets)
    } else {
      getTopSets(http, user.locale).then((sets: SetInfo[]) => {
        setTopSets(sets)
        setCachedTopSets(sets)
      })
    }
  }, [http, user])

  return (
    <Carousel autoplay arrows prevArrow={<LeftOutlined />} nextArrow={<RightOutlined />} className="top--24px">
      {topSets && topSets.map((set, index) => <TopSetItem set={set} key={index}></TopSetItem>)}
    </Carousel>
  )
}

export default TopSets
