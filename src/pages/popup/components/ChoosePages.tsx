import * as React from "react"

import { usePopupContext } from "../contexts/PopupContext"

import { Card, Space, Checkbox, notification } from "antd"
import { CheckCircleFilled } from "@ant-design/icons"

import { SupportingPages } from "@consts/constants"
import NextPrevButton from "./NextPrevButton"
import { User } from "@/common/types/types"
import RegisterSteps from "@/common/consts/registerSteps"
import { updateUserInfo } from "@/common/api/user"

import BrandIcon from "@/common/components/BrandIcon"
import PopupHeader from "./Header"

const { useState } = React

function ChoosePages() {
  const { user, setUser } = usePopupContext()

  const [chosePages, setChosePages] = useState<string[]>(user?.pages || [SupportingPages.facebook.key])

  const headerText = chrome.i18n.getMessage("popup_introduce_choose_pages")

  const goForward = async () => {
    const nextStep = user ? RegisterSteps.next(user.finishedRegisterStep) : null
    nextStep && (await goToStep(nextStep))
  }

  const goBack = async () => {
    const prevStep = user ? RegisterSteps.prev(user.finishedRegisterStep) : null
    prevStep && (await goToStep(prevStep))
  }

  const goToStep = async (step: number) => {
    try {
      if (!user) return

      const updatedUserInfo: User = {
        ...user,
        finishedRegisterStep: step,
        pages: chosePages,
      }

      await updateUserInfo({ finishedRegisterStep: step, pages: chosePages })

      setUser(updatedUserInfo)
    } catch (error) {
      // TODO: Handle more types of error: Server/Timeout/Network etc..
      notification["error"]({
        message: chrome.i18n.getMessage("error"),
        description: chrome.i18n.getMessage("unexpected_error_message"),
      })
    }
  }

  const selectPage = (page: string) => {
    setChosePages([...chosePages, page])
  }

  const selectAllPages = (e: { target: { checked: boolean } }) => {
    const isSelectAllPages = e.target.checked
    setChosePages(isSelectAllPages ? Object.keys(SupportingPages) : [])
  }

  const isPageSelected = (page: string) => chosePages.includes(page)

  return (
    <>
      <div className="choose-pages--wrapper">
        <PopupHeader content={headerText} />

        <div className="choose-pages--pages-list">
          <NextPrevButton direction={"both"} onNext={goForward} onPrev={goBack} />

          <Space align="end" style={{ marginRight: 18 }}>
            <Checkbox onChange={selectAllPages}>{chrome.i18n.getMessage("select_all")}</Checkbox>
          </Space>

          <Card bordered={false}>
            {Object.entries(SupportingPages).map(([page, pageInfo]) => (
              <Card.Grid key={page} hoverable={false}>
                <div
                  className={`choose-pages--page-item has-text-white has-text-centered ${page} 
                  ${isPageSelected(page) ? "selected" : ""}`}
                  onClick={() => selectPage(page)}
                >
                  <CheckCircleFilled className="choose-pages--selected-icon" />
                  <div className="choose-pages--icon">{<BrandIcon brandName={page} />}</div>
                  {pageInfo.title}
                </div>
              </Card.Grid>
            ))}
          </Card>
        </div>
      </div>
    </>
  )
}

export default ChoosePages
