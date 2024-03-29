import React, { useEffect, useRef, useState } from "react"

import { useNavigate } from "react-router-dom"
import ReCAPTCHA from "react-google-recaptcha"

import { AppPages, i18n, ItemTypes, RecaptchaSiteKey, TabKeyCode } from "@/common/consts/constants"
import {
  Affix,
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Form,
  Input,
  notification,
  Row,
  Select,
  Space,
  Typography,
} from "antd"
import { RequiredRule } from "@/common/consts/validationRules"
import { MinusCircleFilled, PlusOutlined, ArrowLeftOutlined } from "@ant-design/icons"

import { useCreateSetContext } from "../contexts/CreateSetContext"
import { LanguageCode, SetInfo } from "@/common/types/types"
import { createSet, editSet } from "@/common/repo/set"
import { useGlobalContext } from "@/common/contexts/GlobalContext"
import useEventListener from "@/common/hooks/useEventListener"

import ShibaBoxImg from "@img/emojis/shiba/box.png"
import { deepClone } from "@/common/utils/utils"
import { ParamError } from "@/common/consts/errors"
import useLocalStorage from "@/common/hooks/useLocalStorage"
import CacheKeys from "@/common/consts/caching"
import SupportingLanguages from "@/common/consts/supportingLanguages"
import { removeToNewArrayAtIndex } from "@/common/utils/arrayUtils"
import RichTextEditor from "@/pages/app/components/RichTextEditor"

const DefaultInitAnswersCount = 4
const DefaultInitItemCount = 5
const { Option } = Select

export const CreateSetItemsForm = () => {
  const { http } = useGlobalContext()
  const navigate = useNavigate()

  const { currentStep, setCurrentStep, setInfo, setSetInfo, isEdit } = useCreateSetContext()

  const [itemCount, setItemCount] = useState<number>(setInfo?.items?.length || DefaultInitItemCount)

  const [termDefItemsCount, setTermDefItemsCount] = useState<number>(
    setInfo?.items?.filter((item) => item.type === ItemTypes.TermDef.value).length || DefaultInitItemCount
  )
  const [itemTypes, setItemTypes] = useState<string[]>(
    Array.from(Array(itemCount).keys()).map((i: number) => setInfo?.items?.at(i)?.type || ItemTypes.TermDef.value)
  )
  const [lastItemType, setLastItemType] = useState<string>(ItemTypes.TermDef.value)
  const [createLoading, setCreateLoading] = useState<boolean>(false)

  const [, setCachedLastSetInfo] = useLocalStorage<SetInfo | null>(CacheKeys.lastSetInfo, null, "365d")

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

  useEffect(() => {
    if (setInfo?.captchaToken) {
      formRef.submit()
    }
  }, [setInfo])

  const standardizeItems = (items: any[]) => {
    for (let i = 0; i < items.length; i++) {
      if (!items[i].moreInfo) delete items[i].moreInfo
    }

    return items
  }

  const onSetItemsFormFinished = async (itemsInfo: {
    items: any[]
    fromLanguage: LanguageCode
    toLanguage: LanguageCode
  }) => {
    if (!http) return

    itemsInfo.items = standardizeItems(itemsInfo.items)

    const newSetInfo = { ...setInfo, ...itemsInfo } as SetInfo

    try {
      setCreateLoading(true)
      const insertedSetId = isEdit ? await editSet(http, newSetInfo) : await createSet(http, newSetInfo)

      navigate(AppPages.SetDetail.path.replace(":setId", insertedSetId))
    } catch (error) {
      setCachedLastSetInfo(newSetInfo || null)

      notification["error"]({
        message: i18n("error"),
        description: `${i18n("unexpected_error_message")}${
          error instanceof ParamError ? i18n("data_saved_message") : ""
        }`,
      })
    } finally {
      setCreateLoading(false)
    }
  }

  function onItemTypeChanged(this: { itemIndex: number }, itemType: string) {
    if (itemType === ItemTypes.TermDef.value) {
      setTermDefItemsCount(termDefItemsCount + 1)
    } else {
      setTermDefItemsCount(termDefItemsCount - 1)
    }

    let newItemTypes = [...(itemTypes || [])]
    newItemTypes[this.itemIndex] = itemType
    setLastItemType(itemType)

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
        initialValues={{ items: setInfo?.items, fromLanguage: setInfo?.fromLanguage, toLanguage: setInfo?.toLanguage }}
      >
        <ReCAPTCHA
          ref={recaptchaRef}
          size="invisible"
          sitekey={RecaptchaSiteKey}
          onChange={onReCaptchaChange}
          onErrored={onReCaptchaErrored}
          onExpired={onReCaptchaExpired}
        />
        <Affix offsetTop={16}>
          <Card className="create-set-items--head">
            <Row gutter={8}>
              <Col flex="none">
                <Button
                  type="text"
                  shape="circle"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => {
                    const { fromLanguage, toLanguage, items } = formRef.getFieldsValue(true)
                    const newSetInfo = {
                      ...setInfo,
                      fromLanguage,
                      toLanguage,
                      items: deepClone(items),
                      captchaToken: null,
                    } as SetInfo
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
              <Col span={6}>{`${i18n("common_items")}: ${itemCount}`}</Col>
              <Col span={18}>
                <Space className="float-right">
                  <Button
                    size="large"
                    type="primary"
                    className="is-uppercase"
                    loading={createLoading}
                    onClick={() => {
                      recaptchaRef.current.execute()
                    }}
                  >
                    {isEdit ? i18n("common_save_changes") : i18n("create_set_create_button")}
                  </Button>
                </Space>
              </Col>
            </Row>
            <Row gutter={8}>
              <Col span={12}>
                <Form.Item name="fromLanguage" fieldKey="fromLanguage" rules={[RequiredRule]}>
                  <Select
                    showSearch
                    allowClear
                    clearIcon
                    placeholder={i18n("create_set_content_language")}
                    filterOption={(input, option) =>
                      (option?.label?.toString() || "").toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {Object.values(SupportingLanguages.Set).map(({ code, name }) => (
                      <Option key={code} value={code} label={`${name} (${code})`}>{`${name} (${code})`}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              {termDefItemsCount > 0 && (
                <Col span={12}>
                  <Form.Item name="toLanguage" fieldKey="toLanguage" rules={[RequiredRule]}>
                    <Select
                      showSearch
                      allowClear
                      clearIcon
                      placeholder={i18n("create_set_definition_language")}
                      filterOption={(input, option) =>
                        (option?.label?.toString() || "").toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {Object.values(SupportingLanguages.Set).map(({ code, name }) => (
                        <Option key={code} value={code} label={`${name} (${code})`}>{`${name} (${code})`}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              )}
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

              {fields.map(({ key, name, ...restField }, itemIndex: number) => (
                <Card key={key} className="create-set-items--item is-relative">
                  <Form.Item {...restField} name={[name, "type"]} className="create-set-items--item-type-select">
                    <Select
                      options={Object.values(ItemTypes)}
                      value={
                        itemTypes && itemTypes.length > itemIndex ? itemTypes[itemIndex] || lastItemType : lastItemType
                      }
                      onChange={onItemTypeChanged.bind({ itemIndex })}
                    />
                  </Form.Item>

                  <Button
                    className="button create-set-items--remove-button"
                    onClick={() => {
                      itemTypes[itemIndex] === ItemTypes.TermDef.value && setTermDefItemsCount(termDefItemsCount - 1)
                      setItemTypes(removeToNewArrayAtIndex(itemTypes, itemIndex))
                      removeItem(name)
                      setItemCount(itemCount - 1)
                    }}
                  >
                    <MinusCircleFilled />
                  </Button>

                  {(() => {
                    const itemType =
                      itemTypes && itemTypes.length > 0 ? itemTypes[itemIndex] || lastItemType : lastItemType
                    switch (itemType) {
                      case ItemTypes.TermDef.value:
                        return (
                          <Row gutter={8}>
                            <Col span={12}>
                              <Form.Item {...restField} name={[name, "term"]} rules={[RequiredRule]}>
                                <Input placeholder={i18n("create_set_term_placeholder")} />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item {...restField} name={[name, "definition"]} rules={[RequiredRule]}>
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
                              label={i18n("create_set_question_placeholder")}
                              rules={[RequiredRule]}
                            >
                              <RichTextEditor value="" placeholder={i18n("create_set_question_placeholder")} />
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
                                  {answers.map(({ key, name, ...restField }) => (
                                    <Row key={key} gutter={8} align="middle" className="create-set-items--item-answer">
                                      <Col flex="none">
                                        <Form.Item {...restField} name={[name, "isCorrect"]} valuePropName="checked">
                                          <Checkbox />
                                        </Form.Item>
                                      </Col>
                                      <Col flex="auto">
                                        <Form.Item {...restField} name={[name, "answer"]} rules={[RequiredRule]}>
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
                            <Divider />
                            <Form.Item
                              {...restField}
                              name={[name, "moreInfo"]}
                              label={i18n("create_set_hint_placeholder")}
                            >
                              <RichTextEditor value="" placeholder={i18n("create_set_hint_placeholder")} />
                            </Form.Item>
                          </>
                        )

                      case ItemTypes.Content.value:
                        return (
                          <Form.Item
                            {...restField}
                            name={[name, "content"]}
                            label={i18n("create_set_content_label")}
                            rules={[RequiredRule]}
                          >
                            <RichTextEditor value="" placeholder={i18n("create_set_content_placeholder")} />
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
                    lastItemType === ItemTypes.TermDef.value && setTermDefItemsCount(termDefItemsCount + 1)
                    addItem({
                      type: lastItemType,
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
