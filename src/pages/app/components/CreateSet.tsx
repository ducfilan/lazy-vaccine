import * as React from "react"
import ReCAPTCHA from "react-google-recaptcha"

import { Col, Row, Form, Input, Button, Mentions, Card, TreeSelect, Carousel, Typography } from "antd"
import { RightOutlined } from "@ant-design/icons"

import PageHeader from "./PageHeader"
import { CreateSetDescriptionMaxLength, RecaptchaSiteKey, RequestToAddCategoryLink } from "@consts/constants"
import { Category } from "@/common/types/types"
import { useEffect } from "react"
import { getCategories } from "@/common/api/category"
import { useGlobalContext } from "@/common/contexts/GlobalContext"
import useLocalStorage from "@/common/hooks/useLocalStorage"
import CacheKeys from "@/common/consts/cacheKeys"

import shibaTailIcon from "@img/emojis/shiba/tail.png"

const { useState, useRef } = React

const i18n = chrome.i18n.getMessage

const CreateSetForm = () => {
  const { user, http } = useGlobalContext()

  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<string[]>([])
  const recaptchaRef = useRef<any>()

  const [cachedCategories, setCachedCategories] = useLocalStorage<Category[]>(CacheKeys.categories, [], "1d")

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

  const onReCaptchaChange = () => {}

  return (
    <Card>
      <Form layout="vertical">
        <Form.Item name="name" label={i18n("create_set_field_name")} required>
          <Input placeholder={i18n("create_set_field_name_placeholder")} />
        </Form.Item>
        <Form.Item name="category" label={i18n("create_set_field_category")}>
          <TreeSelect treeData={categories} />
        </Form.Item>
        <Form.Item style={{ marginBottom: -14 }}>
          <Typography.Link href={RequestToAddCategoryLink} target="_blank" className="is-absolute" style={{ top: -20 }}>
            {i18n("create_set_request_category")}
          </Typography.Link>
        </Form.Item>
        <Form.Item name="description" label={i18n("create_set_field_description")}>
          <Input.TextArea
            placeholder={i18n("create_set_field_description_placeholder")}
            showCount
            maxLength={CreateSetDescriptionMaxLength}
          />
        </Form.Item>
        <Form.Item name="tags" label={i18n("create_set_field_tags")} extra={i18n("create_set_field_tags_extra")}>
          <Mentions style={{ width: "100%" }} placeholder={i18n("create_set_field_tags_placeholder")} prefix="#">
            {tags.map((value) => (
              <Mentions.Option key={value} value={value}>
                {value}
              </Mentions.Option>
            ))}
          </Mentions>
        </Form.Item>
        <Form.Item>
          <ReCAPTCHA ref={recaptchaRef} sitekey={RecaptchaSiteKey} onChange={onReCaptchaChange} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" icon={<RightOutlined />}>
            {i18n("create_set_next_button")}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}

const CreateSetRightHelper = () => {
  return (
    <>
      <Card className="create-set--right-card">
        <Carousel autoplay>
          <div>
            <h3>{i18n("create_set_help_text_1_title")}</h3>
            <p className="create-set--help-text-content">{i18n("create_set_help_text_1_content")}</p>
          </div>
          <div>
            <h3>{i18n("create_set_help_text_2_title")}</h3>
            <p className="create-set--help-text-content">{i18n("create_set_help_text_2_content")}</p>
          </div>
          <div>
            <h3>{i18n("create_set_help_text_3_title")}</h3>
            <p className="create-set--help-text-content">{i18n("create_set_help_text_3_content")}</p>
            {/* TODO: Add youtube video support. */}
          </div>
        </Carousel>
        <div className="ant-popover-arrow">
          <span className="ant-popover-arrow-content"></span>
        </div>
      </Card>

      <div className="has-text-centered">
        <img
          src={shibaTailIcon}
          style={{
            width: "auto",
            height: "auto",
            fontSize: "169px",
          }}
        />
      </div>
    </>
  )
}

const CreateSetItems = () => {
  return <></>
}

const CreateSetPage = () => {
  const CreateSteps = {
    SetInfo: 0,
    SetItems: 1,
  }

  const [currentStep, setCurrentStep] = useState<number>(CreateSteps.SetInfo)

  return (
    <div className="create-set--wrapper">
      <PageHeader innerContent={chrome.i18n.getMessage("create_set_page_title")} />
      <Row gutter={[16, 16]}>
        <Col xs={{ span: 24 }} lg={{ span: 16 }}>
          {(() => {
            switch (currentStep) {
              case CreateSteps.SetInfo:
                return <CreateSetForm />

              case CreateSteps.SetItems:
                return <CreateSetItems />

              default:
                return ""
            }
          })()}
        </Col>
        <Col xs={{ span: 24 }} lg={{ span: 8 }}>
          <CreateSetRightHelper />
        </Col>
      </Row>
    </div>
  )
}

export default CreateSetPage
