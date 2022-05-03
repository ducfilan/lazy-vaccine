import * as React from "react"
import { Col, Row, Checkbox, Card, Divider } from "antd"
import { useSetDetailContext } from "../contexts/SetDetailContext"
import { ItemTypes } from "@/common/consts/constants"

const i18n = chrome.i18n.getMessage

const Items = () => {
  const { setInfo } = useSetDetailContext()

  return (
    <div className="set-detail--items pad-16px">
      {setInfo?.items?.map((item, si) => {
        let innerContent

        switch (item.type) {
          case ItemTypes.TermDef.value:
            innerContent = (
              <Row gutter={8}>
                <Col flex="auto" span={12}>
                  <p style={{ whiteSpace: "pre-line" }}>{item.term}</p>
                </Col>
                <Col flex="none">
                  <Divider type="vertical" />
                </Col>
                <Col flex="auto" span={12}>
                  <p style={{ whiteSpace: "pre-line" }}>{item.definition}</p>
                </Col>
              </Row>
            )
            break

          case ItemTypes.QnA.value:
            innerContent = (
              <>
                <p className="set-detail--item-question">{item.question}</p>

                <Divider className="is-uppercase">{i18n("set_detail_answers")}</Divider>
                {item.answers.map((answer: any, ai: number) => (
                  <Row key={ai} gutter={8} align="middle" className="set-detail--item-answer top-16px">
                    <Col flex="none">
                      <Checkbox checked={answer.isCorrect} disabled />
                    </Col>
                    <Col flex="auto">{answer.answer}</Col>
                  </Row>
                ))}
              </>
            )
            break

          case ItemTypes.Content.value:
            innerContent = item.content
            break

          default:
            return ""
        }

        return (
          <Card key={si} hoverable className="bot-16px">
            {innerContent}
          </Card>
        )
      })}
    </div>
  )
}

export default Items
