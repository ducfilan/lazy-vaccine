import React, { useEffect, useState } from "react"
import { CustomerServiceOutlined, EllipsisOutlined } from "@ant-design/icons"

import NextPrevButton from "@/pages/popup/components/NextPrevButton"
import { CardInteraction } from "./CardInteraction"
import { useSetDetailContext } from "../contexts/SetDetailContext"
import {
  i18n,
  ItemsInteractionFlip,
  ItemsInteractionNext,
  ItemsInteractionPrev,
  ItemTypes,
  SettingKeyBackItem,
  SettingKeyFrontItem,
} from "@consts/constants"
import { Button, Skeleton } from "antd"
import { formatString, getMainContent, isValidJson, takeFirstLine } from "@/common/utils/stringUtils"
import RichTextEditor from "@/pages/app/components/RichTextEditor"
import { sendGetLocalSettingMessage } from "@/pages/content-script/messageSenders"
import { CSSTransition } from "react-transition-group"
import useAudio from "@/common/hooks/useAudio"
import { SetInfo } from "@/common/types/types"
import { useGlobalContext } from "@/common/contexts/GlobalContext"
import { interactToSetItem } from "@/common/repo/set"
import { ApiPronounceText } from "@consts/apis"

const FlashCardFaces = {
  front: "front",
  back: "back",
}

export const CardItem = () => {
  const { setInfo } = useSetDetailContext()
  const { http } = useGlobalContext()

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
  const [flashCardDisplayFace, setFlashCardDisplayFace] = useState<string>(FlashCardFaces.front)
  const [isAnimating, setIsAnimating] = useState<boolean>(false)

  const getCurrentDisplayLang = (): string => {
    if (!flashCardDisplayFace || !flashCardSettingKey) return ""

    const flashCardFaceToLangMap = {
      term: "fromLanguage",
      definition: "toLanguage",
    }

    return setInfo[
      (flashCardFaceToLangMap as any)[(flashCardSettingKey as any)[flashCardDisplayFace]] as keyof SetInfo
    ] as string
  }

  const interactItem = (itemId: string | undefined, action: string) => {
    if (!http || !itemId) return

    interactToSetItem(http, setInfo._id, itemId, action).catch((error) => {
      console.error(error)
    })
  }

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
                  onClick={() => {
                    interactItem(item._id, ItemsInteractionFlip)
                    setFlashCardDisplayFace(FlashCardFaces.back)
                  }}
                >
                  <p className="card--content">{item[flashCardSettingKey?.front || "term"]}</p>
                </div>
                <div
                  className="card--face card--face--back"
                  onClick={() => {
                    interactItem(item._id, ItemsInteractionFlip)
                    setFlashCardDisplayFace(FlashCardFaces.front)
                  }}
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
      <TopBar currentIndex={currentIndex} itemLang={getCurrentDisplayLang()} cardFace={flashCardDisplayFace} />
      {renderCardFaceElement()}
      <CardInteraction currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} />
      <NextPrevButton
        direction={
          currentIndex > 0 && currentIndex < setInfo.items!.length - 1 ? "both" : currentIndex > 0 ? "left" : "right"
        }
        onNext={() => {
          if (currentIndex < setInfo.items!.length - 1) {
            interactItem(setInfo.items?.at(currentIndex)?._id, ItemsInteractionNext)
            setIsAnimating(true)
            setCurrentIndex(currentIndex + 1)
            flashCardDisplayFace !== FlashCardFaces.front && setFlashCardDisplayFace(FlashCardFaces.front)
          }
        }}
        onPrev={() => {
          if (currentIndex > 0) {
            interactItem(setInfo.items?.at(currentIndex)?._id, ItemsInteractionPrev)
            setIsAnimating(true)
            setCurrentIndex(currentIndex - 1)
            flashCardDisplayFace !== FlashCardFaces.front && setFlashCardDisplayFace(FlashCardFaces.front)
          }
        }}
      />
    </div>
  )
}

const TopBar = (props: { currentIndex: number; itemLang: string; cardFace: string }) => {
  const { setInfo } = useSetDetailContext()

  if (!setInfo || !props.itemLang) return <></>

  const item = setInfo?.items?.at(props.currentIndex)
  const getDisplayingItemProperty = () => {
    switch (item?.type) {
      case ItemTypes.Content.value:
        return item.content

      case ItemTypes.QnA.value:
        return item.question

      case ItemTypes.TermDef.value:
        if (props.cardFace == FlashCardFaces.front) {
          return item.term
        } else {
          return item.definition
        }

      default:
        break
    }
  }

  return (
    <div className="card-item--top-bar-wrapper">
      <AudioPlayer url={ApiPronounceText(takeFirstLine(getMainContent(getDisplayingItemProperty())), props.itemLang)} />
      <div className="card-item--top-bar-counter">
        {props.currentIndex + 1} / {setInfo.items!.length}
      </div>
      <div className="card-item--top-bar-settings">
        <Button shape="circle" icon={<EllipsisOutlined />} />
      </div>
    </div>
  )
}

const AudioPlayer = (props: { url: string }) => {
  const { http } = useGlobalContext()
  const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined)

  const [play, pause] = useAudio(audioUrl)

  useEffect(() => {
    pause()

    if (!http) return

    http
      .get(props.url, {
        responseType: "arraybuffer",
        headers: {
          "Content-Type": "audio/mpeg",
        },
      })
      .then((result) => {
        const blob = new Blob([result.data], {
          type: "audio/mpeg",
        })
        setAudioUrl(URL.createObjectURL(blob))
      })
      .catch((error) => {
        console.debug(error)
      })
  }, [http, props.url])

  return <Button type="primary" shape="circle" icon={<CustomerServiceOutlined />} onClick={() => play && play()} />
}
