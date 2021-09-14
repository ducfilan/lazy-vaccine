import * as React from "react"
import { ItemTypes, RecaptchaSiteKey, TabKeyCode } from "@/common/consts/constants"
import { Affix, Button, Card, Checkbox, Col, Form, Input, Popconfirm, Row, Select, Space, Typography } from "antd"
import { MinusCircleFilled, PlusOutlined } from "@ant-design/icons"

import { useRef, useState } from "react"
import ReCAPTCHA from "react-google-recaptcha"
import { useCreateSetContext } from "../contexts/CreateSetContext"
import { SetInfo } from "@/common/types/types"
import { createSet } from "@/common/api/set"
import { useGlobalContext } from "@/common/contexts/GlobalContext"
import useEventListener from "@/common/hooks/useEventListener"

const i18n = chrome.i18n.getMessage
const DefaultInitAnswersCount = 4

export const CreateSetItemsForm = () => {
  const { http } = useGlobalContext()
  const { currentStep, setCurrentStep, setInfo, setSetInfo } = useCreateSetContext()

  const [itemCount, setItemCount] = useState<number>(5)
  const [itemTypes, setItemTypes] = useState<string[]>(
    Array.from(Array(itemCount).keys()).map((_) => ItemTypes.TermDef.value)
  )
  const [lastItemType, setLastItemType] = useState<string>(ItemTypes.TermDef.value)
  const recaptchaRef = useRef<any>()
  const addItemButtonRef = useRef<any>()
  const [formRef] = Form.useForm()

  const requiredRule = { required: true, message: i18n("required_field") }

  const onReCaptchaChange = (token: string | null) => {
    console.log(token)
  }

  const onSetItemsFormFinished = (items: []) => {
    setSetInfo({ ...setInfo, items } as SetInfo)
    createSet(http, setInfo)
  }

  function onItemTypeChanged(this: { itemIndex: number }, value: string) {
    let newItemTypes = [...(itemTypes || [])]
    newItemTypes[this.itemIndex] = value
    setLastItemType(value)

    setItemTypes(newItemTypes)
  }

  useEventListener(document, "keydown", (event: KeyboardEvent) => {
    const allInputs = document.querySelectorAll(".create-set-items--item .ant-input")
    const isLastItemInputFocused =
      allInputs && allInputs.length > 0 && allInputs[allInputs.length - 1] == document.activeElement

    if (isLastItemInputFocused && event.code === TabKeyCode) {
      addItemButtonRef.current.click()
    }
  })

  return (
    <>
      <Form layout="vertical" onFinish={onSetItemsFormFinished} form={formRef}>
        <Affix offsetTop={16}>
          <Card className="create-set-items--head">
            <Typography.Title level={3} className="page-header--title">
              {setInfo?.name}
            </Typography.Title>
            <Row align="middle">
              <Col span={6}>{`${i18n("popup_stats_items")}: ${itemCount}`}</Col>
              <Col span={18}>
                <Space className="float-right">
                  <Popconfirm
                    title={<ReCAPTCHA ref={recaptchaRef} sitekey={RecaptchaSiteKey} onChange={onReCaptchaChange} />}
                    icon={""}
                    placement="bottom"
                    onConfirm={() => formRef.submit()}
                    okText={i18n("common_create")}
                    cancelText={i18n("common_back")}
                  >
                    <Button size="large" type="primary" className="is-uppercase">
                      {i18n("create_set_create_button")}
                    </Button>
                  </Popconfirm>
                </Space>
              </Col>
            </Row>
          </Card>
        </Affix>
        <Form.List
          name="items"
          initialValue={Array.from(Array(itemCount).keys()).map((_) => ({ term: "", definition: "" }))}
        >
          {(fields, { add: addItem, remove: removeItem }) => (
            <>
              {fields.map(({ key, name, fieldKey, ...restField }, itemIndex: number) => (
                <Card key={key} className="create-set-items--item is-relative">
                  <Select
                    options={Object.values(ItemTypes)}
                    defaultValue={ItemTypes.TermDef.value}
                    value={
                      itemTypes && itemTypes.length > itemIndex ? itemTypes[itemIndex] || lastItemType : lastItemType
                    }
                    className="create-set-items--item-type-select"
                    onChange={onItemTypeChanged.bind({ itemIndex })}
                  />

                  <button
                    className="button create-set-items--remove-button"
                    onClick={() => {
                      removeItem(name)
                      setItemCount(itemCount - 1)
                    }}
                  >
                    <MinusCircleFilled />
                  </button>

                  {(() => {
                    const itemType =
                      itemTypes && itemTypes.length > 0 ? itemTypes[itemIndex] || lastItemType : lastItemType
                    switch (itemType) {
                      case ItemTypes.TermDef.value:
                        return (
                          <Row gutter={8}>
                            <Col span={12}>
                              <Form.Item
                                {...restField}
                                name={[name, "term"]}
                                fieldKey={[fieldKey, "term"]}
                                rules={[requiredRule]}
                              >
                                <Input placeholder={i18n("create_set_term_placeholder")} />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item
                                {...restField}
                                name={[name, "definition"]}
                                fieldKey={[fieldKey, "definition"]}
                                rules={[requiredRule]}
                              >
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
                              rules={[
                                {
                                  validator: async (_, answers) => {
                                    console.log(_)
                                    console.log(answers)
                                    if (!answers || answers.length < 2) {
                                      return Promise.reject(new Error(i18n("create_set_answer_validation_warning")))
                                    }

                                    return Promise.resolve()
                                  },
                                },
                              ]}
                            >
                              {(answers, { add: addAnswer, remove: removeAnswer }, { errors }) => (
                                <>
                                  <div className="create-set-items--check-guide">
                                    {i18n("create_set_answer_check_guide")}
                                  </div>
                                  {answers.map(({ key, name, fieldKey, ...restField }) => (
                                    <Row key={key} gutter={8} align="middle" className="create-set-items--item-answer">
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
                                          rules={[requiredRule]}
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
                                  <Form.ErrorList errors={errors} />
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

                      case ItemTypes.Content.value:
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

                      default:
                        return ""
                    }
                  })()}
                </Card>
              ))}
              <Form.Item>
                <Button
                  ref={addItemButtonRef}
                  type="primary"
                  size="large"
                  onClick={() => {
                    addItem()
                    setItemCount(itemCount + 1)
                    let newItemTypes = [...(itemTypes || [])]
                    newItemTypes.push(lastItemType)
                    setItemTypes(newItemTypes)
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
      </Form>
    </>
  )
}
