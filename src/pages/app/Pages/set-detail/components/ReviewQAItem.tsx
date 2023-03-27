import React, { useEffect, useState } from "react"

import { Button } from "antd"
import { formatString, isValidJson } from "@/common/utils/stringUtils"
import { useGlobalContext } from "@/common/contexts/GlobalContext"
import { i18n, ItemsInteractionAnswerCorrect, ItemsInteractionAnswerIncorrect } from "@/common/consts/constants"
import { SetInfoItem } from "@/common/types/types"
import RichTextEditor from "@/pages/app/components/RichTextEditor"
import { interactToSetItem } from "@/common/repo/set"

const ReviewQAItem = ({ item, setId }: { item: SetInfoItem; setId: string }) => {
  const { http } = useGlobalContext()
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number>(-1)
  const [isAnswered, setIsAnswered] = useState<boolean>(false)
  const [isAnsweredCorrect, setIsAnsweredCorrect] = useState<boolean>(false)

  useEffect(() => {
    setSelectedAnswerIndex(-1)
    setIsAnswered(false)
    setIsAnsweredCorrect(false)
  }, [item])

  const interactItem = (itemId: string | undefined, action: string) => {
    if (!http || !itemId) return

    interactToSetItem(http, setId, itemId, action).catch((error) => {
      console.error(error)
    })
  }

  return (
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
          {item.answers?.map((answer, i) => (
            <div
              key={answer.answer}
              className={`answer-btn ${selectedAnswerIndex === i ? "selected" : ""} ${
                selectedAnswerIndex === i && isAnswered && isAnsweredCorrect ? "correct" : ""
              } ${item.answers && item.answers[i].isCorrect && isAnswered ? "correct" : ""} ${
                selectedAnswerIndex === i && isAnswered && !isAnsweredCorrect ? "incorrect" : ""
              }`}
              onClick={() => {
                setIsAnswered(false)
                setSelectedAnswerIndex(i)
              }}
            >
              {answer.answer}
            </div>
          ))}
        </div>
        <div className="check--wrapper">
          <Button
            type="primary"
            size="middle"
            className="check--btn"
            onClick={() => {
              if (selectedAnswerIndex !== -1) {
                setIsAnswered(true)

                const isCorrect = item.answers?.[selectedAnswerIndex]?.isCorrect!
                setIsAnsweredCorrect(isCorrect)
                interactItem(item._id, isCorrect ? ItemsInteractionAnswerCorrect : ItemsInteractionAnswerIncorrect)
              }
            }}
          >
            {i18n("common_check")}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ReviewQAItem
