import * as React from "react"
import { useState, useEffect } from "react"

import { getCategories } from "@/common/api/category"
import CacheKeys from "@/common/consts/cacheKeys"
import {
  RequestToAddCategoryLink,
  CreateSetDescriptionMaxLength,
  RequiredRule,
  MaxLengthSetTitle,
} from "@/common/consts/constants"
import { useGlobalContext } from "@/common/contexts/GlobalContext"
import useLocalStorage from "@/common/hooks/useLocalStorage"
import { Category, SetInfo } from "@/common/types/types"
import { Form, Typography, Input, Mentions, Button, Card, TreeSelect, Select, Alert, Space, Popconfirm } from "antd"
import { RightOutlined } from "@ant-design/icons"
import { useCreateSetContext } from "../contexts/CreateSetContext"
import { Prompt } from "react-router"
import { deepClone, preventReload } from "@/common/utils/utils"

const i18n = chrome.i18n.getMessage

export const CreateSetForm = () => {
  const { user, http } = useGlobalContext()

  const { currentStep, setCurrentStep, setInfo, setSetInfo } = useCreateSetContext()

  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [cachedCategories, setCachedCategories] = useLocalStorage<Category[]>(CacheKeys.categories, [], "1d")
  const [cachedLastSetInfo, setCachedLastSetInfo] = useLocalStorage<SetInfo | null>(CacheKeys.lastSetInfo, null, "365d")
  const [isDataSaved, setIsDataSaved] = useState<boolean>(true)

  const onSetInfoFormFinished = (newSetInfo: SetInfo) => {
    const mergedSetInfo = { ...deepClone(setInfo || {}), ...newSetInfo }
    setSetInfo(mergedSetInfo)
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

  const removeCachedSetInfo = () => {
    setCachedLastSetInfo(null)
  }

  const restoreSavedSetInfo = () => {
    cachedLastSetInfo && setSetInfo(cachedLastSetInfo)
    removeCachedSetInfo()
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

      {cachedLastSetInfo && (
        <Alert
          message={i18n("create_set_having_unsaved_set_warning")}
          type="warning"
          action={
            <Space>
              <Popconfirm
                title="Are you sure to delete this task?"
                onConfirm={removeCachedSetInfo}
                okText={i18n("common_yes")}
                cancelText={i18n("common_no")}
              >
                <Button size="small" danger type="ghost">
                  {i18n("common_remove")}
                </Button>
              </Popconfirm>
              <Button size="small" type="primary" onClick={restoreSavedSetInfo}>
                {i18n("common_restore")}
              </Button>
            </Space>
          }
          closable
        />
      )}

      <Card>
        <Form
          layout="vertical"
          onFinish={onSetInfoFormFinished}
          onValuesChange={onSetInfoFormValuesChanged}
          initialValues={setInfo}
        >
          <Form.Item name="name" label={i18n("create_set_field_name")} rules={[RequiredRule]}>
            <Input placeholder={i18n("create_set_field_name_placeholder")} maxLength={MaxLengthSetTitle} />
          </Form.Item>
          <Form.Item
            name="categoryId"
            label={
              <>
                {i18n("create_set_field_category")}
                {" - "}
                <Typography.Link href={RequestToAddCategoryLink} target="_blank" style={{ marginLeft: 4 }}>
                  {i18n("create_set_request_category")}
                </Typography.Link>
              </>
            }
            rules={[RequiredRule]}
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
            <Select mode="tags" style={{ width: "100%" }} placeholder={i18n("create_set_field_tags_placeholder")}>
              {tags.map((value) => (
                <Select.Option key={value} value={value}>
                  {value}
                </Select.Option>
              ))}
            </Select>
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
