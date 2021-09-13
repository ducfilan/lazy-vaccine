import * as React from "react"
import { useState, useEffect } from "react"

import { getCategories } from "@/common/api/category"
import CacheKeys from "@/common/consts/cacheKeys"
import { RequestToAddCategoryLink, CreateSetDescriptionMaxLength } from "@/common/consts/constants"
import { useGlobalContext } from "@/common/contexts/GlobalContext"
import useLocalStorage from "@/common/hooks/useLocalStorage"
import { Category, SetInfo } from "@/common/types/types"
import { Form, Typography, Input, Mentions, Button, Card, TreeSelect } from "antd"
import { RightOutlined } from "@ant-design/icons"
import { useCreateSetContext } from "../contexts/CreateSetContext"
import { Prompt } from "react-router"
import { preventReload } from "@/common/utils/utils"

const i18n = chrome.i18n.getMessage

export const CreateSetForm = () => {
  const { user, http } = useGlobalContext()

  const { currentStep, setCurrentStep, setSetInfo } = useCreateSetContext()

  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [cachedCategories, setCachedCategories] = useLocalStorage<Category[]>(CacheKeys.categories, [], "1d")
  const [isDataSaved, setIsDataSaved] = useState<boolean>(true)

  const requiredRule = { required: true, message: i18n("required_field") }

  const onSetInfoFormFinished = (setInfo: SetInfo) => {
    setSetInfo(setInfo)
    setCurrentStep(currentStep + 1)
  }

  const onSetInfoFormValuesChanged = (_: any, allValues: any) => {
    for (const field in allValues) {
      if (Object.prototype.hasOwnProperty.call(allValues, field)) {
        const fieldValue = allValues[field]
        if (fieldValue) {
          setIsDataSaved(false)
          return
        }
      }
    }

    setIsDataSaved(true)
  }

  useEffect(() => {
    if (!http || !user) return

    if (cachedCategories) {
      setCategories(cachedCategories)
    } else {
      getCategories(http, user.locale).then((categories: Category[]) => {
        setCategories(categories)
        setCachedCategories(categories)
      })
    }
  }, [http, user])

  useEffect(() => preventReload(!isDataSaved), [isDataSaved])

  return (
    <>
      <Prompt when={!isDataSaved} message={i18n("leave_warning_message")} />
      <Card>
        <Form layout="vertical" onFinish={onSetInfoFormFinished} onValuesChange={onSetInfoFormValuesChanged}>
          <Form.Item name="name" label={i18n("create_set_field_name")} rules={[requiredRule]}>
            <Input placeholder={i18n("create_set_field_name_placeholder")} />
          </Form.Item>
          <Form.Item
            name="category"
            label={
              <>
                {i18n("create_set_field_category")}
                {" - "}
                <Typography.Link href={RequestToAddCategoryLink} target="_blank" style={{ marginLeft: 4 }}>
                  {i18n("create_set_request_category")}
                </Typography.Link>
              </>
            }
            rules={[requiredRule]}
          >
            <TreeSelect treeData={categories} />
          </Form.Item>
          <Form.Item name="description" label={i18n("create_set_field_description")}>
            <Input.TextArea
              placeholder={i18n("create_set_field_description_placeholder")}
              showCount
              maxLength={CreateSetDescriptionMaxLength}
            />
          </Form.Item>
          <Form.Item name="tags" label={i18n("create_set_field_tags")} extra={i18n("create_set_field_tags_extra")}>
            <Mentions
              style={{ width: "100%" }}
              placeholder={i18n("create_set_field_tags_placeholder")}
              prefix="#"
              split=", "
            >
              {tags.map((value) => (
                <Mentions.Option key={value} value={value}>
                  {value}
                </Mentions.Option>
              ))}
            </Mentions>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<RightOutlined />}>
              {i18n("create_set_next_button")}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </>
  )
}
