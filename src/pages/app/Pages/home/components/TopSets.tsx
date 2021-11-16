import * as React from "react"
import { Carousel, Row, Col } from "antd"

import { useGlobalContext } from "@/common/contexts/GlobalContext"
import { useState } from "react"
import { SetInfo } from "@/common/types/types"

const i18n = chrome.i18n.getMessage

const { useEffect } = React

const TopSets = () => {
  const { user, http } = useGlobalContext()
  const [topSets, setTopSets] = useState<SetInfo[]>([])

  useEffect(() => {
    if (!http || !user) return

    if (topSets) {
      setTopSets(topSets)
    } else {
      getTopSets(http, user.locale).then((sets: SetInfo[]) => {
        setTopSets(sets)
        setCachedTopSets(sets)
      })
    }
  }, [http, user])

  return (
    <Carousel autoplay>
      <Row>
        <Col></Col>
        <Col></Col>
      </Row>
    </Carousel>
  )
}

export default TopSets
