import React, { useEffect, useState } from "react"
import { CustomerServiceOutlined, EllipsisOutlined } from "@ant-design/icons"

import NextPrevButton from "@/pages/popup/components/NextPrevButton"
import { CardInteraction } from "./CardInteraction"
import { useSetDetailContext } from "../contexts/SetDetailContext"
import { i18n, ItemTypes, SettingKeyBackItem, SettingKeyFrontItem } from "@/common/consts/constants"
import { Button, Skeleton } from "antd"
import { formatString, isValidJson } from "@/common/utils/stringUtils"
import RichTextEditor from "@/pages/app/components/RichTextEditor"
import { sendGetLocalSettingMessage } from "@/pages/content-script/messageSenders"
import { CSSTransition } from "react-transition-group"

const FlashCardFaces = {
  front: 0,
  back: 1,
}

export const CardItem = () => {
  const { setInfo } = useSetDetailContext()

  if (!setInfo) {
    return <></>
  }

  // TODO: Add interaction requests.

  const [flashCardSettingKey, setFlashCardSettingKey] = useState<{ front: string; back: string } | undefined>()

  useEffect(() => {
    Promise.all([sendGetLocalSettingMessage(SettingKeyFrontItem), sendGetLocalSettingMessage(SettingKeyBackItem)])
      .then(([frontSettingValue, backSettingValue]) => {
        setFlashCardSettingKey({
          front: frontSettingValue || "term",
          back: backSettingValue || "definition",
        })
      })
      .catch(() => {
        setFlashCardSettingKey({
          front: "term",
          back: "definition",
        })
      })
  }, [])

  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [flashCardDisplayFace, setFlashCardDisplayFace] = useState<number>(FlashCardFaces.front)
  const [isAnimating, setIsAnimating] = useState<boolean>(false)

  const renderCardFaceElement = () => {
    const item = setInfo.items?.at(currentIndex)

    let element = <></>

    switch (item?.type) {
      case ItemTypes.TermDef.value:
        if (!flashCardSettingKey) {
          element = <Skeleton key={item?._id} active loading />
        } else {
          const isFrontDisplaying = flashCardDisplayFace === FlashCardFaces.front

          element = (
            <div key={item?._id} className={`flash-card-wrapper ${isFrontDisplaying ? "" : "is-flipped"}`}>
              <div className="card-face">
                <div
                  className="card--face card--face--front"
                  onClick={() => setFlashCardDisplayFace(FlashCardFaces.back)}
                >
                  <p className="card--content">{item[flashCardSettingKey?.front || "term"]}</p>
                </div>
                <div
                  className="card--face card--face--back"
                  onClick={() => setFlashCardDisplayFace(FlashCardFaces.front)}
                >
                  <p className="card--content">{item[flashCardSettingKey?.back || "definition"]}</p>
                </div>
              </div>
            </div>
          )
        }
        break

      case ItemTypes.Content.value:
        element = (
          <div key={item?._id} className="content-card-wrapper">
            <div className="card--face card--face--front">
              <RichTextEditor readOnly value={item.content} />
            </div>
          </div>
        )
        break

      case ItemTypes.QnA.value:
        element = (
          <div key={item?._id} className="qna-card-wrapper">
            <div className="card--content">
              <p className="card--question">
                {isValidJson(item.question) ? (
                  <RichTextEditor readOnly value={item.question} />
                ) : (
                  <p className="set-detail--item-question">{item.question}</p>
                )}
              </p>
              <p>
                {formatString(i18n("inject_card_select"), [
                  { key: "correctAnswerCount", value: `${item.answers?.filter((a) => a.isCorrect).length || 1}` },
                ])}
              </p>
              <div className="answer--wrapper">
                {item.answers?.map((answer) => (
                  <div className="answer-btn">{answer.answer}</div>
                ))}
              </div>
              <div className="check--wrapper">
                <Button type="primary" size="middle" className="check--btn">
                  {i18n("common_check")}
                </Button>
              </div>
            </div>
          </div>
        )
        break

      default:
        break
    }

    return (
      <CSSTransition in={isAnimating} timeout={500} classNames="card-item">
        {element}
      </CSSTransition>
    )
  }

  setTimeout(() => setIsAnimating(false), 500)

  return (
    <div className="lazy-vaccine">
      <TopBar currentIndex={currentIndex} />
      {renderCardFaceElement()}
      <CardInteraction />
      <NextPrevButton
        direction={
          currentIndex > 0 && currentIndex < setInfo.items!.length - 1 ? "both" : currentIndex > 0 ? "left" : "right"
        }
        onNext={() => {
          if (currentIndex < setInfo.items!.length - 1) {
            setIsAnimating(true)
            setCurrentIndex(currentIndex + 1)
            flashCardDisplayFace !== FlashCardFaces.front && setFlashCardDisplayFace(FlashCardFaces.front)
          }
        }}
        onPrev={() => {
          if (currentIndex > 0) {
            setIsAnimating(true)
            setCurrentIndex(currentIndex - 1)
            flashCardDisplayFace !== FlashCardFaces.front && setFlashCardDisplayFace(FlashCardFaces.front)
          }
        }}
      />
    </div>
  )
}

const TopBar = (props: { currentIndex: number }) => {
  const { setInfo } = useSetDetailContext()

  return (
    <div className="card-item--top-bar-wrapper">
      <Button type="primary" shape="circle" icon={<CustomerServiceOutlined />} />
      <div className="card-item--top-bar-counter">
        {props.currentIndex + 1} / {setInfo!.items!.length}
      </div>
      <div className="card-item--top-bar-settings">
        <Button shape="circle" icon={<EllipsisOutlined />} />
      </div>
    </div>
  )
}
