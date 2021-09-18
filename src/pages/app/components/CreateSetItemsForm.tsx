import * as React from "react"
import { ItemTypes, RecaptchaSiteKey, RequiredRule, TabKeyCode } from "@/common/consts/constants"
import {
  Affix,
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Form,
  Input,
  Popconfirm,
  Row,
  Select,
  Space,
  Typography,
} from "antd"
import { MinusCircleFilled, PlusOutlined, ArrowLeftOutlined } from "@ant-design/icons"

import { useRef, useState } from "react"
import ReCAPTCHA from "react-google-recaptcha"
import { useCreateSetContext } from "../contexts/CreateSetContext"
import { SetInfo } from "@/common/types/types"
import { createSet } from "@/common/api/set"
import { useGlobalContext } from "@/common/contexts/GlobalContext"
import useEventListener from "@/common/hooks/useEventListener"

import ShibaBoxImg from "@img/emojis/shiba/box.png"
import { deepClone } from "@/common/utils/utils"

const i18n = chrome.i18n.getMessage
const DefaultInitAnswersCount = 4

export const CreateSetItemsForm = () => {
  const { http } = useGlobalContext()
  const { currentStep, setCurrentStep, setInfo, setSetInfo } = useCreateSetContext()

  const [itemCount, setItemCount] = useState<number>(setInfo?.items?.length || 5)
  const [itemTypes, setItemTypes] = useState<string[]>(
    Array.from(Array(itemCount).keys()).map((i: number) => setInfo?.items?.at(i)?.type || ItemTypes.TermDef.value)
  )
  const [lastItemType, setLastItemType] = useState<string>(ItemTypes.TermDef.value)
  const recaptchaRef = useRef<any>()
  const addItemButtonRef = useRef<any>()
  const [formRef] = Form.useForm()

  const onReCaptchaChange = (captchaToken: string | null) => {
    const newSetInfo = { ...setInfo, captchaToken } as SetInfo
    setSetInfo(newSetInfo)
  }

  const onReCaptchaErrored = () => {
    const newSetInfo = { ...setInfo, captchaToken: null } as SetInfo
    setSetInfo(newSetInfo)
  }

  const onReCaptchaExpired = () => {
    const newSetInfo = { ...setInfo, captchaToken: null } as SetInfo
    setSetInfo(newSetInfo)
  }

  const onSetItemsFormFinished = ({ items }: { items: [] }) => {
    const newSetInfo = { ...setInfo, items } as SetInfo
    setSetInfo(newSetInfo)
    createSet(http, newSetInfo)
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
      <Form
        layout="vertical"
        onFinish={onSetItemsFormFinished}
        form={formRef}
        preserve={false}
        initialValues={{ items: setInfo?.items }}
      >
        <Affix offsetTop={16}>
          <Card className="create-set-items--head">
            <Row gutter={8}>
              <Col flex="none">
                <Button
                  type="text"
                  shape="circle"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => {
                    const { items } = formRef.getFieldsValue(true)
                    const newSetInfo = { ...setInfo, items: deepClone(items) } as SetInfo
                    setSetInfo(newSetInfo)
                    setCurrentStep(currentStep - 1)
                  }}
                />
              </Col>
              <Col flex="auto">
                <Typography.Title level={3} className="page-header--title">
                  {setInfo?.name}
                </Typography.Title>
              </Col>
            </Row>
            <Row align="middle">
              <Col span={6}>{`${i18n("popup_stats_items")}: ${itemCount}`}</Col>
              <Col span={18}>
                <Space className="float-right">
                  <Popconfirm
                    title={
                      <div className="create-set-items--captcha">
                        <ReCAPTCHA
                          ref={recaptchaRef}
                          sitekey={RecaptchaSiteKey}
                          onChange={onReCaptchaChange}
                          onErrored={onReCaptchaErrored}
                          onExpired={onReCaptchaExpired}
                        />
                        {!setInfo?.captchaToken && (
                          <Typography.Text type="danger">{i18n("create_set_check_captcha_warning")}</Typography.Text>
                        )}
                      </div>
                    }
                    icon={""}
                    placement="bottom"
                    onConfirm={() => formRef.submit()}
                    okButtonProps={{ disabled: !setInfo?.captchaToken }}
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
          initialValue={Array.from(Array(itemCount).keys()).map((_) => ({
            type: ItemTypes.TermDef.value,
            term: "",
            definition: "",
          }))}
          rules={[
            {
              validator: async (_, items) => {
                if (!items || items.length < 2) {
                  return Promise.reject(new Error(i18n("create_set_items_validation_warning")))
                }

                return Promise.resolve()
              },
            },
          ]}
        >
          {(fields, { add: addItem, remove: removeItem }, { errors: itemErrors }) => (
            <>
              {itemErrors &&
                itemErrors.map((error, index) => (
                  <Alert
                    key={index}
                    message={error}
                    type="warning"
                    showIcon
                    icon={<img src={ShibaBoxImg} style={{ width: 100 }} />}
                    closable
                  />
                ))}

              {fields.map(({ key, name, fieldKey, ...restField }, itemIndex: number) => (
                <Card key={key} className="create-set-items--item is-relative">
                  <Form.Item
                    {...restField}
                    name={[name, "type"]}
                    fieldKey={[fieldKey, "type"]}
                    className="create-set-items--item-type-select"
                  >
                    <Select
                      options={Object.values(ItemTypes)}
                      value={
                        itemTypes && itemTypes.length > itemIndex ? itemTypes[itemIndex] || lastItemType : lastItemType
                      }
                      onChange={onItemTypeChanged.bind({ itemIndex })}
                    />
                  </Form.Item>

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
                                rules={[RequiredRule]}
                              >
                                <Input placeholder={i18n("create_set_term_placeholder")} />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item
                                {...restField}
                                name={[name, "definition"]}
                                fieldKey={[fieldKey, "definition"]}
                                rules={[RequiredRule]}
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
                              rules={[RequiredRule]}
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
                                          rules={[RequiredRule]}
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
                            rules={[RequiredRule]}
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
                  className="create-set-items--add-item"
                  ref={addItemButtonRef}
                  type="primary"
                  size="large"
                  onClick={() => {
                    addItem({
                      type: lastItemType,
                      term: "",
                      definition: "",
                    })
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
