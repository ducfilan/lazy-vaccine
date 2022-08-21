import React, { useEffect, useState } from "react"

import { LoginTypes } from "@/common/consts/constants"
import { Modal } from "antd"

import { getGoogleAuthTokenSilent } from "@/common/facades/authFacade"
import { useGlobalContext } from "@/common/contexts/GlobalContext"
import { Http } from "@/common/facades/axiosFacade"
import { getMyInfo } from "@/common/repo/user"
import { getErrorView } from "../../App"
import RegisterSteps from "@/common/consts/registerSteps"

import Loading from "@/common/components/Loading"
import FirstTime from "./components/FirstTime"
import ChooseLanguages from "./components/ChooseLanguages"
import FinishedGettingStarted from "./components/FinishedGettingStarted"

export const GettingStartedPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [lastError, setLastError] = useState<any>(null)

  const { user, setUser, setHttp } = useGlobalContext()

  useEffect(() => {
    window.heap.track("Open getting started page")
  }, [])

  useEffect(() => {
    setIsLoading(true)

    getGoogleAuthTokenSilent()
      .then((token: string) => {
        const newHttp = new Http(token, LoginTypes.google)
        setHttp(newHttp)

        getMyInfo(newHttp)
          .then((userInfo) => {
            setUser(userInfo)

            window.heap.identify(userInfo.email)
            window.heap.addUserProperties({ "finished_register_step": userInfo.finishedRegisterStep })
          })
          .catch((error) => {
            setLastError(error)
            setUser(null)
            // Not able to login with current token or the user is not registered, ignore to show the first page to login.
          })
          .finally(() => {
            setIsLoading(false)
          })
      })
      .catch((error: any) => {
        setHttp(null)
        setIsLoading(false)
        setLastError(error)
      })
  }, [])

  function renderContent() {
    if (lastError) return getErrorView(lastError, setLastError, <FirstTime />)

    if (isLoading)
      return (
        <div>
          <Loading />
        </div>
      )

    const finishedRegisterStep = user?.finishedRegisterStep

    switch (finishedRegisterStep) {
      case RegisterSteps.ChooseLanguages:
        return <FinishedGettingStarted />

      case RegisterSteps.Install:
        return <FirstTime />

      case RegisterSteps.Register:
        return (
          <div tabIndex={0}>
            <ChooseLanguages />
          </div>
        )

      default:
        return <FirstTime />
    }
  }

  return (
    <div className="getting-started-wrapper">
      <Modal
        closable={false}
        footer={null}
        centered
        visible={true}
        onOk={() => window.close()}
        width={783}
        wrapClassName="getting-started-modal-wrapper"
      >
        {renderContent()}
      </Modal>
    </div>
  )
}
