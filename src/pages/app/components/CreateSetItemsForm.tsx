import * as React from "react"
import { ItemTypes, RecaptchaSiteKey } from "@/common/consts/constants"
import { Affix, Button, Card, Checkbox, Col, Form, Input, Row, Select, Space } from "antd"
import { MinusCircleFilled, PlusOutlined } from "@ant-design/icons"

import { useRef, useState } from "react"
import ReCAPTCHA from "react-google-recaptcha"

const i18n = chrome.i18n.getMessage
const DefaultInitAnswersCount = 4

export const CreateSetItemsForm = () => {
  const [itemCount, setItemCount] = useState<number>(5)
  const [currentItemType, setCurrentItemType] = useState<string>(ItemTypes.TermDef.value)
  const recaptchaRef = useRef<any>()

  const requiredRule = { required: true, message: i18n("required_field") }

  const onReCaptchaChange = () => {}
  const onSetItemsFormFinished = () => {}

  const onItemTypeChanged = (value: string) => {
    setCurrentItemType(value)
  }

  return (
    <>
      <Row className="create-set-items--head">
        <Col span={6}>{`${i18n("popup_stats_items")}: ${itemCount}`}</Col>
        <Col span={18}>
          <Affix offsetTop={16}>
            <Space className="float-right">
              <Button size="large" type="primary">
                {i18n("create_set_create_button")}
              </Button>
            </Space>
          </Affix>
        </Col>
      </Row>
      <Form layout="vertical" onFinish={onSetItemsFormFinished}>
        <Form.List
          name="items"
          initialValue={Array.from(Array(itemCount).keys()).map((_) => ({ term: "", definition: "" }))}
        >
          {(fields, { add: addItem, remove: removeItem }) => (
            <>
              {fields.map(({ key, name, fieldKey, ...restField }) => (
                <Card key={key} className="create-set-items--item is-relative">
                  <Select
                    options={Object.values(ItemTypes)}
                    defaultValue={ItemTypes.TermDef.value}
                    value={currentItemType}
                    className="create-set-items--item-type-select"
                    onChange={onItemTypeChanged}
                  />

                  <button className="button create-set-items--remove-button" onClick={() => removeItem(name)}>
                    <MinusCircleFilled />
                  </button>

                  {(() => {
                    switch (currentItemType) {
                      case ItemTypes.TermDef.value:
                        return (
                          <Row gutter={8}>
                            <Col span={12}>
                              <Form.Item {...restField} name={[name, "term"]} fieldKey={[fieldKey, "term"]}>
                                <Input placeholder={i18n("create_set_term_placeholder")} />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item {...restField} name={[name, "definition"]} fieldKey={[fieldKey, "definition"]}>
                                <Input placeholder={i18n("create_set_definition_placeholder")} />
                              </Form.Item>
                            </Col>
                          </Row>
                        )

                      case ItemTypes.QnA.value:
                        return (
                          <>
                            <Form.Item
                              {...restField}
                              name={[name, "question"]}
                              fieldKey={[fieldKey, "question"]}
                              label={i18n("create_set_question_placeholder")}
                              rules={[requiredRule]}
                            >
                              <Input.TextArea placeholder={i18n("create_set_question_placeholder")} />
                            </Form.Item>
                            <Form.List
                              name={[name, "answers"]}
                              initialValue={Array.from(Array(DefaultInitAnswersCount).keys()).map((_) => ({
                                isCorrect: false,
                                answer: "",
                              }))}
                            >
                              {(answers, { add: addAnswer, remove: removeAnswer }) => (
                                <>
                                  <div className="create-set-items--check-guide">Check on correct anwser(s)</div>
                                  {answers.map(({ key, name, fieldKey, ...restField }) => (
                                    <Row gutter={8} align="middle" className="create-set-items--item-answer">
                                      <Col flex="none">
                                        <Form.Item
                                          {...restField}
                                          name={[name, "isCorrect"]}
                                          fieldKey={[fieldKey, "isCorrect"]}
                                          valuePropName="checked"
                                        >
                                          <Checkbox />
                                        </Form.Item>
                                      </Col>
                                      <Col flex="auto">
                                        <Form.Item
                                          {...restField}
                                          name={[name, "answer"]}
                                          fieldKey={[fieldKey, "answer"]}
                                        >
                                          <Input.TextArea
                                            autoSize
                                            placeholder={i18n("create_set_answer_placeholder")}
                                          />
                                        </Form.Item>
                                      </Col>
                                      <Col flex="none">
                                        <Button
                                          danger
                                          type="link"
                                          size="small"
                                          icon={<PlusOutlined className="rotate-45deg" />}
                                          onClick={() => {
                                            removeAnswer(name)
                                          }}
                                        />
                                      </Col>
                                    </Row>
                                  ))}
                                  <Form.Item className="create-set-items--add-answer">
                                    <Button
                                      type="primary"
                                      size="small"
                                      onClick={() => {
                                        addAnswer()
                                      }}
                                      icon={<PlusOutlined />}
                                    >
                                      {i18n("create_set_add_answer")}
                                    </Button>
                                  </Form.Item>
                                </>
                              )}
                            </Form.List>
                          </>
                        )

                      default:
                        return (
                          <Form.Item
                            {...restField}
                            name={[name, "content"]}
                            fieldKey={[fieldKey, "content"]}
                            label={i18n("create_set_content_label")}
                            rules={[requiredRule]}
                          >
                            <Input.TextArea placeholder={i18n("create_set_content_placeholder")} />
                          </Form.Item>
                        )
                    }
                  })()}
                </Card>
              ))}
              <Form.Item>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => {
                    addItem()
                    setItemCount(itemCount + 1)
                  }}
                  block
                  icon={<PlusOutlined />}
                >
                  {i18n("create_set_add_item")}
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
        <ReCAPTCHA ref={recaptchaRef} sitekey={RecaptchaSiteKey} onChange={onReCaptchaChange} />
      </Form>
    </>
  )
}
