import React from "react"
import { Col, Row, Checkbox, Card, Divider, Tabs } from "antd"
import { useSetDetailContext } from "../contexts/SetDetailContext"
import { i18n, ItemTypes } from "@/common/consts/constants"
import RichTextEditor from "@/pages/app/components/RichTextEditor"
import { isValidJson } from "@/common/utils/stringUtils"
import { SetInfoItem } from "@/common/types/types"

const turnItemToElements = (items: SetInfoItem[]) => {
  return items.map((item, si) => {
    let innerContent

    switch (item.type) {
      case ItemTypes.TermDef.value:
        innerContent = (
          <Row gutter={8}>
            <Col flex="auto" span={11}>
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
            {isValidJson(item.question) ? (
              <RichTextEditor readOnly value={item.question} />
            ) : (
              <p className="set-detail--item-question">{item.question}</p>
            )}

            <Divider className="is-uppercase">{i18n("set_detail_answers")}</Divider>
            {item.answers!.map((answer: any, ai: number) => (
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
        innerContent = <RichTextEditor readOnly value={item.content} />
        break

      default:
        return <></>
    }

    return (
      <Card key={si} hoverable className="bot-16px">
        {innerContent}
      </Card>
    )
  })
}

const Items = () => {
  const { setInfo } = useSetDetailContext()

  if (!setInfo?.items) return <></>

  return (
    <div className="set-detail--items pad-16px">
      <Tabs
        defaultActiveKey="1"
        centered
        items={[
          {
            label: i18n("common_all_items"),
            key: "1",
            children: <>{turnItemToElements(setInfo.items)}</>,
          },
          {
            label: i18n("common_starred_only"),
            key: "2",
            children: <>{turnItemToElements(setInfo.items.filter((item) => item.isStarred))}</>,
          },
        ]}
      />
    </div>
  )
}

export default Items
