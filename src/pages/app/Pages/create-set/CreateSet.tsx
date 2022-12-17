import React from "react"
import { useParams } from "react-router-dom"

import { Col, notification, Row } from "antd"

import PageHeader from "@/pages/app/components/PageHeader"
import { SetInfo } from "@/common/types/types"
import { getSetInfo } from "@/common/repo/set"
import { useGlobalContext } from "@/common/contexts/GlobalContext"

import { CreateSetContext } from "./contexts/CreateSetContext"
import { CreateSetForm } from "./components/CreateSetForm"
import { CreateSetRightHelper } from "./components/CreateSetRightHelper"
import { CreateSetItemsForm } from "./components/CreateSetItemsForm"
import { i18n } from "@/common/consts/constants"
import { TrackingNameOpenCreateSetPage } from "@/common/consts/trackingNames"
import { track } from "@amplitude/analytics-browser"

const { useEffect, useState } = React

const CreateSteps = {
  SetInfo: 0,
  SetItems: 1,
}

const CreateSetPage = () => {
  const { http } = useGlobalContext()
  const [currentStep, setCurrentStep] = useState<number>(CreateSteps.SetInfo)
  const [setInfo, setSetInfo] = useState<SetInfo>()

  const { setId } = useParams()
  const isEdit = !!setId

  function onPageLoaded() {
    if (!http || !setId) return

    getSetInfo(http, setId)
      .then(setSetInfo)
      .catch(() => {
        notification["error"]({
          message: i18n("error"),
          description: i18n("unexpected_error_message"),
          duration: null,
        })
      })
  }

  useEffect(onPageLoaded, [http])

  useEffect(() => {
    track(TrackingNameOpenCreateSetPage)
  }, [])

  const renderContent = () => {
    switch (currentStep) {
      case CreateSteps.SetInfo:
        return (
          <>
            <PageHeader innerContent={isEdit ? i18n("edit_set_page_title") : i18n("create_set_page_title")} />
            <Row gutter={[16, 16]}>
              <Col xs={{ span: 24 }} lg={{ span: 16 }}>
                <CreateSetForm />
              </Col>
              <Col xs={{ span: 24 }} lg={{ span: 8 }}>
                <CreateSetRightHelper />
              </Col>
            </Row>
          </>
        )

      case CreateSteps.SetItems:
        return <CreateSetItemsForm />

      default:
        return ""
    }
  }

  return (
    <CreateSetContext.Provider value={{ currentStep, setCurrentStep, setInfo, setSetInfo, isEdit }}>
      <div className="create-set--wrapper">{renderContent()}</div>
    </CreateSetContext.Provider>
  )
}

export default CreateSetPage
