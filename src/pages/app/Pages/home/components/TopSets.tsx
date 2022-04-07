import * as React from "react"
import { Button, Carousel, Skeleton } from "antd"
import { LeftOutlined, RightOutlined } from "@ant-design/icons"

import { useGlobalContext } from "@/common/contexts/GlobalContext"
import { useState } from "react"
import { SetInfo } from "@/common/types/types"
import { getTopSets } from "@/common/repo/set"
import SetItemCardLong from "@/pages/app/components/SetItemCardLong"

const i18n = chrome.i18n.getMessage

const { useEffect } = React

const prevButtonStyle = {
  left: 0,
  borderRadius: 0,
  borderTopRightRadius: 13,
  borderBottomRightRadius: 13,
}

const nextButtonStyle = {
  right: 0,
  borderRadius: 0,
  borderTopLeftRadius: 13,
  borderBottomLeftRadius: 13,
}

const TopSets = () => {
  const { user, http } = useGlobalContext()
  const [topSets, setTopSets] = useState<SetInfo[]>([])

  useEffect(() => {
    if (!http || !user) return

    getTopSets(http, user.locale).then((sets: SetInfo[]) => {
      setTopSets(sets)
    })
  }, [http, user])

  return topSets && topSets.length ? (
    <Carousel
      autoplay
      arrows
      prevArrow={<Button type="primary" size="large" icon={<LeftOutlined />} style={prevButtonStyle} />}
      nextArrow={<Button type="primary" size="large" icon={<RightOutlined />} style={nextButtonStyle} />}
    >
      {topSets && topSets.map((set, index) => <SetItemCardLong set={set} key={index} />)}
    </Carousel>
  ) : (
    <Skeleton active />
  )
}

export default TopSets
