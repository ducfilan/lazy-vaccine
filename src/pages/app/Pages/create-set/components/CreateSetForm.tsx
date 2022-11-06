import React from "react"
import Resizer from "react-image-file-resizer"

import { getCategories } from "@/common/repo/category"
import CacheKeys from "@/common/consts/caching"
import {
  RequestToAddCategoryLink,
  CreateSetDescriptionMaxLength,
  MaxLengthSetTitle,
  MaxTagsCountPerSet,
  StaticBaseUrl,
  i18n,
} from "@/common/consts/constants"
import { RequiredRule, MaxLengthRule } from "@/common/consts/validationRules"
import { useGlobalContext } from "@/common/contexts/GlobalContext"
import useLocalStorage from "@/common/hooks/useLocalStorage"
import { Category, SetInfo, UploadImageResponse } from "@/common/types/types"
import { Form, Typography, Input, Button, Card, TreeSelect, Select, Alert, Space, Popconfirm, Upload } from "antd"
import { RightOutlined, LoadingOutlined, PlusOutlined } from "@ant-design/icons"
import { useCreateSetContext } from "../contexts/CreateSetContext"
import { deepClone, preventReload } from "@/common/utils/utils"
import ImgCrop from "antd-img-crop"
import { RcFile, UploadChangeParam, UploadFile } from "antd/lib/upload/interface"
import { getExtensionFromFileType, getHash } from "@/common/utils/stringUtils"
import { getPreSignedUploadUrl, uploadImage } from "@/common/repo/image"

const { useState, useEffect } = React

const imageWidthInPx = 300
const imageHeightInPx = 300

const resizeAndCompressImage = (file: File) =>
  new Promise((resolve) => {
    Resizer.imageFileResizer(
      file,
      imageWidthInPx,
      imageHeightInPx,
      "JPEG",
      80,
      0,
      (uri) => {
        resolve(uri)
      },
      "file"
    )
  })

export const CreateSetForm = () => {
  const { user, http } = useGlobalContext()

  const { currentStep, setCurrentStep, setInfo, setSetInfo, isEdit } = useCreateSetContext()

  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [cachedCategories, setCachedCategories] = useLocalStorage<Category[]>(CacheKeys.categories, [], "1d")
  const [cachedLastSetInfo, setCachedLastSetInfo] = useLocalStorage<SetInfo | null>(CacheKeys.lastSetInfo, null, "7d")
  const [isDataSaved, setIsDataSaved] = useState<boolean>(true)
  const [imageUrl, setImageUrl] = useState<string>()
  const [uploadingImage, setUploadingImage] = useState<boolean>(false)

  const [formRef] = Form.useForm()

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

  const getUploadFileInfo = async (file: RcFile) => {
    if (!http || !user) return

    const ext = getExtensionFromFileType(file.type)

    // TODO: Hash on server side.
    const uniqueFileName = `${getHash(user?.email)}_${getHash(file.name)}_${new Date().getTime()}.${ext}`

    const url = await getPreSignedUploadUrl(http, uniqueFileName, file.type)

    return { preSignedUrl: url, fileName: uniqueFileName, fileType: file.type }
  }

  const onImageUploaderChange = (info: UploadChangeParam<UploadFile<UploadImageResponse>>) => {
    if (info.file.status === "uploading") {
      setUploadingImage(true)
      return
    }

    if (info.file.status === "done") {
      setUploadingImage(false)
    }
  }

  const onImageUpload = async (info: any) => {
    const { preSignedUrl, fileName, fileType } = (await getUploadFileInfo(info.file)) || {}

    if (!preSignedUrl) return

    const file = await resizeAndCompressImage(info.file)

    const isUploadSuccess = await uploadImage(preSignedUrl!, file, {
      headers: {
        "x-amz-acl": "public-read",
        "Content-Type": fileType!,
      },
    })

    if (isUploadSuccess) {
      setUploadingImage(false)
      const imgUrl = `${StaticBaseUrl}/${fileName}`
      setImageUrl(imgUrl)
      formRef.setFieldsValue({ imgUrl })
    }
  }

  const removeCachedSetInfo = () => {
    setCachedLastSetInfo(null)
  }

  const restoreSavedSetInfo = () => {
    cachedLastSetInfo && setSetInfo(cachedLastSetInfo)
    cachedLastSetInfo && formRef.setFieldsValue(cachedLastSetInfo)
    removeCachedSetInfo()

    setIsDataSaved(false)
  }

  const uploadButton = (
    <div>
      {uploadingImage ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>{i18n("common_upload")}</div>
    </div>
  )

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

  useEffect(() => {
    if (!setInfo) {
      return
    }

    formRef.setFieldsValue(setInfo)
    setImageUrl(setInfo.imgUrl)
    formRef.setFieldsValue({ imgUrl: setInfo.imgUrl })
  }, [setInfo])

  useEffect(() => preventReload(!isDataSaved), [isDataSaved])

  return (
    <>
      {/* <Prompt when={!isDataSaved} message={i18n("leave_warning_message")} /> */}

      {cachedLastSetInfo && !isEdit && (
        <Alert
          message={i18n("create_set_having_unsaved_set_warning")}
          type="warning"
          className="bot-16px"
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
          form={formRef}
          layout="vertical"
          onFinish={onSetInfoFormFinished}
          onValuesChange={onSetInfoFormValuesChanged}
          initialValues={setInfo}
        >
          <Form.Item name="imgUrl" label={i18n("create_set_set_picture")}>
            <ImgCrop rotate modalTitle={i18n("common_edit_image")} modalCancel={i18n("common_cancel")} minZoom={0.5}>
              <Upload
                listType="picture-card"
                showUploadList={false}
                accept="image/jpeg,image/png"
                method="PUT"
                onChange={onImageUploaderChange}
                customRequest={onImageUpload}
              >
                {imageUrl ? <img src={imageUrl} style={{ width: "100%" }} /> : uploadButton}
              </Upload>
            </ImgCrop>
          </Form.Item>
          <Form.Item name="name" label={i18n("create_set_field_name")} rules={[RequiredRule]}>
            <Input placeholder={i18n("create_set_field_name_placeholder")} maxLength={MaxLengthSetTitle} />
          </Form.Item>
          <Form.Item
            name="categoryId"
            label={
              <>
                {i18n("common_category")}
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
          <Form.Item
            name="tags"
            label={i18n("create_set_field_tags")}
            extra={i18n("create_set_field_tags_extra")}
            rules={[MaxLengthRule(MaxTagsCountPerSet)]}
          >
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
