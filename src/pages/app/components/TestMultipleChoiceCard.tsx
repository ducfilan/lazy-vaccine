import { SetInfoItem } from "@/common/types/types"
import { Card, Row } from "antd"
import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react"

const i18n = chrome.i18n.getMessage

const TestMultipleChoiceCard = forwardRef((props: { setItem: SetInfoItem }, ref) => {
  const [setItem, setSetItem] = useState<SetInfoItem>()
  useImperativeHandle(ref, () => ({
    getSetItem: () => {
      return setItem
    }
  }), [setItem]);

  useEffect(() => {
    const { answers } = props.setItem
    const mappedAnswers = answers && answers.map(answer => {
      return {
        ...answer,
        selectedAnswer: null
      }
    });
    setSetItem({
      ...props.setItem,
      answers: mappedAnswers
    });
  }, []);
  const selectAnswer = (answerIdx: number) => {
    if (!setItem || !setItem.answers) {
      return
    }
    const updatedAnswers = [
      ...setItem.answers.slice(0, answerIdx),
      {
        ...setItem.answers[answerIdx],
        selectedAnswer: !setItem.answers[answerIdx].selectedAnswer
      },
      ...setItem.answers.slice(answerIdx + 1),
    ]
    setSetItem({
      ...setItem,
      answers: updatedAnswers
    })
  }

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>}>
      <Card style={{ padding: "0 40px", width: "100%", margin: "5px" }}>
        <Row>
          <p>{setItem?.question}</p>
        </Row>
        <div className="answers--wrapper">
          {setItem?.answers && setItem?.answers.map((answer, idx) => <div className={`answer-btn ${answer?.selectedAnswer ? 'selected' : ''}`} onClick={() => selectAnswer(idx)}>{answer.answer}</div>)}
        </div>
      </Card>
    </div>

  )
})

export default TestMultipleChoiceCard
