import React, { useMemo, useState } from "react"
import { Col, Row, Checkbox, Card, Divider, Tabs, Button } from "antd"
import { StarFilled } from "@ant-design/icons"
import { useSetDetailContext } from "../contexts/SetDetailContext"
import { i18n, ItemsInteractionStar, ItemTypes } from "@/common/consts/constants"
import RichTextEditor from "@/pages/app/components/RichTextEditor"
import { isValidJson } from "@/common/utils/stringUtils"
import { SetInfo, SetInfoItem } from "@/common/types/types"
import { interactToSetItem } from "@/common/repo/set"
import { useGlobalContext } from "@/common/contexts/GlobalContext"
import { Http } from "@/common/facades/axiosFacade"

export default function Items() {
  const { http } = useGlobalContext()
  const { setInfo } = useSetDetailContext()
  const [displayItems, setDisplayItems] = useState<SetInfoItem[] | undefined>(setInfo?.items)

  const [TabAllItems, TabStarredItems] = ["1", "2"]

  if (!http || !setInfo?.items) return <></>

  const displayItemElements = useMemo(
    () => turnItemToElements.call({ http, setInfo, setDisplayItems }, displayItems),
    [displayItems]
  )

  return (
    <div className="set-detail--items pad-16px">
      <Tabs
        defaultActiveKey={TabAllItems}
        centered
        onChange={(activeKey: string) => {
          switch (activeKey) {
            case TabAllItems:
              setDisplayItems(setInfo.items)
              break

            case TabStarredItems:
              setDisplayItems(setInfo.items.filter((item) => item.isStarred))
              break

            default:
              break
          }
        }}
        items={[
          {
            label: i18n("common_all_items"),
            key: TabAllItems,
            children: <>{displayItemElements}</>,
          },
          {
            label: i18n("common_starred_only"),
            key: TabStarredItems,
            children: <>{displayItemElements}</>,
          },
        ]}
      />
    </div>
  )
}

function turnItemToElements(
  this: { http: Http | null | undefined; setInfo: SetInfo; setDisplayItems: any },
  items: SetInfoItem[] | undefined
) {
  const { http, setInfo, setDisplayItems } = this

  if (!items) return []

  let itemElements: JSX.Element[] = []

  items.forEach((item, i) => {
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
    }

    itemElements.push(
      <Card key={i} hoverable className="bot-16px">
        {innerContent}
        <Button
          type="link"
          className={`set-detail--item--star ${item.isStarred ? "starred" : ""}`}
          icon={<StarFilled />}
          onClick={() => {
            if (!http || !setInfo) return

            items[i].isStarred = !item.isStarred

            setDisplayItems([...items])

            interactToSetItem(http, setInfo._id, item._id, ItemsInteractionStar).catch((error) => {
              console.error(error)
            })
          }}
        />
      </Card>
    )
  })

  return itemElements
}
