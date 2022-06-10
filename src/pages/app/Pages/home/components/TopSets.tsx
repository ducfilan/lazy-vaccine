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

const SlickArrowLeft = ({ currentSlide, slideCount, ...props }: any) => (
  <button
    {...props}
    className={
      "ant-btn ant-btn-primary ant-btn-lg ant-btn-icon-only slick-arrow slick-prev" +
      (currentSlide === 0 ? " slick-disabled" : "")
    }
    aria-hidden="true"
    aria-disabled={currentSlide === 0 ? true : false}
    type="button"
    style={prevButtonStyle}
  >
    <span role="img" aria-label="left" className="anticon anticon-left">
      <svg
        viewBox="64 64 896 896"
        focusable="false"
        data-icon="left"
        width="1em"
        height="1em"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M724 218.3V141c0-6.7-7.7-10.4-12.9-6.3L260.3 486.8a31.86 31.86 0 000 50.3l450.8 352.1c5.3 4.1 12.9.4 12.9-6.3v-77.3c0-4.9-2.3-9.6-6.1-12.6l-360-281 360-281.1c3.8-3 6.1-7.7 6.1-12.6z"></path>
      </svg>
    </span>
  </button>
)
const SlickArrowRight = ({ currentSlide, slideCount, ...props }: any) => (
  <button
    {...props}
    className={
      "ant-btn ant-btn-primary ant-btn-lg ant-btn-icon-only slick-arrow slick-next" +
      (currentSlide === slideCount - 1 ? " slick-disabled" : "")
    }
    aria-hidden="true"
    aria-disabled={currentSlide === slideCount - 1 ? true : false}
    type="button"
    style={nextButtonStyle}
  >
    <span role="img" aria-label="right" className="anticon anticon-right">
      <svg
        viewBox="64 64 896 896"
        focusable="false"
        data-icon="right"
        width="1em"
        height="1em"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M765.7 486.8L314.9 134.7A7.97 7.97 0 00302 141v77.3c0 4.9 2.3 9.6 6.1 12.6l360 281.1-360 281.1c-3.9 3-6.1 7.7-6.1 12.6V883c0 6.7 7.7 10.4 12.9 6.3l450.8-352.1a31.96 31.96 0 000-50.4z"></path>
      </svg>
    </span>
  </button>
)

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
    <Carousel autoplay arrows prevArrow={<SlickArrowLeft />} nextArrow={<SlickArrowRight />}>
      {topSets && topSets.map((set, index) => <SetItemCardLong set={set} key={index} />)}
    </Carousel>
  ) : (
    <Skeleton active />
  )
}

export default TopSets
