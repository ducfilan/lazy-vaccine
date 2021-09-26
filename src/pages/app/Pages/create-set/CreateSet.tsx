import * as React from "react"

import { Col, Row } from "antd"

import PageHeader from "../../components/PageHeader"
import { SetInfo } from "@/common/types/types"

import { CreateSetContext } from "./contexts/CreateSetContext"
import { CreateSetForm } from "./components/CreateSetForm"
import { CreateSetRightHelper } from "./components/CreateSetRightHelper"
import { CreateSetItemsForm } from "./components/CreateSetItemsForm"

const { useState } = React

const CreateSteps = {
  SetInfo: 0,
  SetItems: 1,
}

const CreateSetPage = () => {
  const [currentStep, setCurrentStep] = useState<number>(CreateSteps.SetInfo)
  const [setInfo, setSetInfo] = useState<SetInfo>()

  const renderContent = (currentStep: number) => {
    switch (currentStep) {
      case CreateSteps.SetInfo:
        return (
          <>
            <PageHeader innerContent={chrome.i18n.getMessage("create_set_page_title")} />
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
    <CreateSetContext.Provider value={{ currentStep, setCurrentStep, setInfo, setSetInfo }}>
      <div className="create-set--wrapper">{renderContent(currentStep)}</div>
    </CreateSetContext.Provider>
  )
}

export default CreateSetPage
