import { Button } from "antd"
import React, { Dispatch, SetStateAction, useEffect, useState } from "react"
import { ThunderboltFilled, MinusCircleOutlined, StarFilled } from "@ant-design/icons"
import {
  i18n,
  ItemsInteractionForcedDone,
  ItemsInteractionIgnore,
  ItemsInteractionStar,
} from "@/common/consts/constants"
import { useGlobalContext } from "@/common/contexts/GlobalContext"
import { interactToSetItem } from "@/common/repo/set"
import { useSetDetailContext } from "../contexts/SetDetailContext"

export const CardInteraction = ({
  currentIndex,
  setCurrentIndex,
}: {
  currentIndex: number
  setCurrentIndex: Dispatch<SetStateAction<number>>
}) => {
  const { setInfo } = useSetDetailContext()
  const { http } = useGlobalContext()

  if (!setInfo) {
    return <></>
  }

  const currentItem = setInfo.items?.at(currentIndex)

  const [isStarred, setIsStarred] = useState<boolean>(false)

  useEffect(() => {
    const isCurrentItemStarred =
      (setInfo.itemsInteractions?.find((i) => i.itemId === currentItem?._id)?.interactionCount[ItemsInteractionStar] ||
        0) %
        2 ===
      1
    setIsStarred(isCurrentItemStarred)
  }, [currentIndex])

  const interactItem = (itemId: string | undefined, action: string) => {
    if (!http || !itemId) return

    interactToSetItem(http, setInfo._id, itemId, action).catch((error) => {
      console.error(error)
    })
  }

  return (
    <div className="card--interactions">
      <Button
        ghost
        type="primary"
        className="card--interactions--ignore"
        size="large"
        icon={<MinusCircleOutlined />}
        onClick={() => {
          interactItem(setInfo.items?.at(currentIndex)?._id, ItemsInteractionIgnore)
          setCurrentIndex(currentIndex + 1)
        }}
      >
        {i18n("common_ignore")}
      </Button>

      <Button
        ghost
        type="primary"
        className={`card--interactions--star ${isStarred ? "stared" : ""}`}
        size="large"
        icon={<StarFilled />}
        onClick={() => {
          interactItem(setInfo.items?.at(currentIndex)?._id, ItemsInteractionStar)
          setIsStarred(!isStarred)
        }}
      ></Button>

      <Button
        ghost
        type="primary"
        className="card--interactions--got-it"
        size="large"
        icon={<ThunderboltFilled />}
        onClick={() => {
          interactItem(setInfo.items?.at(currentIndex)?._id, ItemsInteractionForcedDone)
          setCurrentIndex(currentIndex + 1)
        }}
      >
        {i18n("common_got_it")}
      </Button>
    </div>
  )
}
