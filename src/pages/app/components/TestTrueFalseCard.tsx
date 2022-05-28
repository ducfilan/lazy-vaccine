import { SetInfoItem } from "@/common/types/types"
import { Button, Card, Col, Row } from "antd"
import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react"

const i18n = chrome.i18n.getMessage

const TestTrueFalseCard = forwardRef((props: { setItem: SetInfoItem }, ref) => {
  const [setItem, setSetItem] = useState<SetInfoItem>()
  useImperativeHandle(ref, () => ({
    getSetItem: () => {
      return setItem
    }
  }), [setItem]);

  useEffect(() => {
    setSetItem(props.setItem);
  }, []);

  const selectAnswer = (answer: boolean) => {
    if (!setItem) {
      return
    }
    setSetItem({
      ...setItem,
      selectedAnswer: answer
    })
  }

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>}>
      <Card style={{ padding: "0 40px", width: "100%", margin: "5px" }}>
        <Row justify="space-around" >
          <Col span={12}>
            <p className="bold">{i18n("common_term")}</p>
            <p className="term-content">{setItem?.term}</p>
          </Col>
          <Col span={12}>
            <p className="bold">{i18n("common_definition")}</p>
            <p className="definition-label">{setItem?.defOption}</p>
          </Col>
        </Row>
        <Row justify="center">
          <Button
            size="middle"
            onClick={() => selectAnswer(true)}
            className={`margin-8px ${setItem?.selectedAnswer === true ? 'selected-btn' : ''}`}
          >
            True
          </Button>
          <Button
            size="middle"
            className={`margin-8px ${setItem?.selectedAnswer === false ? 'selected-btn' : ''}`}
            onClick={() => selectAnswer(false)}
          >
            False
          </Button>
        </Row>
      </Card>
    </div>

  )
})

export default TestTrueFalseCard
