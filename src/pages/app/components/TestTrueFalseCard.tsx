import { i18n } from "@/common/consts/constants"
import { SetInfoItem } from "@/common/types/types"
import { Button, Card, Col, Row } from "antd"
import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react"

const TestTrueFalseCard = forwardRef((props: { setItem: SetInfoItem }, ref) => {
  const [setItem, setSetItem] = useState<SetInfoItem>()
  useImperativeHandle(
    ref,
    () => ({
      getSetItem: () => {
        return setItem
      },
    }),
    [setItem]
  )

  useEffect(() => {
    setSetItem(props.setItem)
  }, [])

  const selectAnswer = (answer: boolean) => {
    if (!setItem) {
      return
    }
    setSetItem({
      ...setItem,
      selectedAnswer: answer,
    })
  }

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>}>
      <Card style={{ padding: "0 40px", width: "100%", margin: "5px" }}>
        <Row justify="space-around">
          <Col span={12}>
            <p className="bold">{i18n("common_term")}</p>
            <p className="term-content">{setItem?.term}</p>
          </Col>
          <Col span={12}>
            <p className="bold">{i18n("common_definition")}</p>
            <p className="definition-label">{setItem?.defOption}</p>
          </Col>
        </Row>
        <Row justify="center" gutter={[16, 16]} style={{ borderTop: "1px solid #f0f0f0" }}>
          <Col span={12} style={{ marginTop: 8 }}>
            <Button
              size="middle"
              onClick={() => selectAnswer(true)}
              className={`margin-8px ${setItem?.selectedAnswer === true ? "selected-btn" : ""}`}
              block
            >
              True
            </Button>
          </Col>
          <Col span={12} style={{ marginTop: 8 }}>
            <Button
              size="middle"
              className={`margin-8px ${setItem?.selectedAnswer === false ? "selected-btn" : ""}`}
              onClick={() => selectAnswer(false)}
              block
            >
              False
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  )
})

export default TestTrueFalseCard
