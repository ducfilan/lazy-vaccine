import React, { useEffect, useState } from "react"

import { LocalStorageKeyPrefix, LoginTypes } from "@/common/consts/constants"
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
import { CacheKeyIsFinishedShowSubscribeGuide, CacheKeyRandomSet } from "@/common/consts/caching"
import {
  TrackingNameFinishLanguageSelection,
  TrackingNameFinishLogin,
  TrackingNameOpenGettingStartedPage,
} from "@/common/consts/trackingNames"
import MissionIntro from "./components/MissionIntro"

export const GettingStartedPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [lastError, setLastError] = useState<any>(null)

  const { user, setUser, setHttp } = useGlobalContext()

  const [finishedRegisterStep, setFinishedRegisterStep] = useState<number>()

  useEffect(() => {
    window.heap.track(TrackingNameOpenGettingStartedPage)

    localStorage.removeItem(LocalStorageKeyPrefix + CacheKeyRandomSet)
    localStorage.removeItem(LocalStorageKeyPrefix + CacheKeyIsFinishedShowSubscribeGuide)
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
            setLastError(null)

            window.heap.identify(userInfo.email)
            window.heap.addUserProperties({
              name: userInfo?.name || "",
              finished_register_step: userInfo.finishedRegisterStep,
            })
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

  useEffect(() => {
    setLastError(null)
    user && setFinishedRegisterStep(user?.finishedRegisterStep || RegisterSteps.Install)
  }, [user])

  function renderContent() {
    if (lastError) return getErrorView(lastError, <FirstTime />)

    if (isLoading)
      return (
        <div>
          <Loading />
        </div>
      )

    switch (finishedRegisterStep) {
      case RegisterSteps.ChooseLanguages:
        window.heap.track(TrackingNameFinishLanguageSelection)
        return <FinishedGettingStarted />

      case RegisterSteps.Install:
        return <FirstTime />

      case RegisterSteps.Register:
        window.heap.track(TrackingNameFinishLogin)
        return (
          <div tabIndex={0}>
            <ChooseLanguages />
          </div>
        )

      default:
        return <Loading />
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
