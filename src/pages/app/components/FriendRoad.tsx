import React from "react"

import { Badge, notification, Popover, Steps } from "antd"
import "./css/friend-road.scss"
import TailImg from "@img/emojis/shiba/tail.png"
import UserDefaultImg from "@img/ui/fa/user-solid.svg"
import ImagePin from "./ImagePin"
import { useGlobalContext } from "@/common/contexts/GlobalContext"
import { User } from "@/common/types/types"
import { i18n } from "@/common/consts/constants"

import PinGuideImg from "@img/ui/pin-guide.gif"

const { Step } = Steps

const FriendRoad = (props: { steps: { title: string; description: string }[] }) => {
  const { user, setUser } = useGlobalContext()
  const finishedRegisterStep = user?.finishedRegisterStep || 0

  return (
    <div className="friend-road--wrapper">
      <div className="images-pins--wrapper">
        <ImagePin
          style={{ marginLeft: `${finishedRegisterStep * 208}px` }}
          img={
            user?.pictureUrl || (
              <UserDefaultImg
                style={{
                  top: 10,
                  left: 20,
                  position: "absolute",
                  color: "white",
                  width: 60,
                }}
              />
            )
          }
          imgStyle={{ width: 80, left: 10, top: 10 }}
        />
        <ImagePin
          style={{
            position: "absolute",
            right: 20,
            bottom: -10,
          }}
          img={
            <Badge count={1}>
              <Popover
                content={
                  <div>
                    <p style={{ fontSize: 20 }}>{i18n("suggestion_pin_extension")}</p>
                    <img src={chrome.runtime.getURL(`${PinGuideImg}`)} />
                  </div>
                }
              >
                <img src={TailImg} style={{ width: 90, left: 5, borderRadius: 0 }} />
              </Popover>
            </Badge>
          }
        />
      </div>
      <Steps progressDot current={finishedRegisterStep}>
        {props.steps.map((step, i) => (
          <Step
            key={`step_${i}`}
            title={step.title}
            description={step.description}
            onStepClick={(index: number) => {
              if (index > finishedRegisterStep) {
                notification.info({
                  message: `${user?.name || i18n("common_friend")}!`,
                  description: `${i18n("popup_introduce_close_friend_message")}`,
                  placement: "top",
                })
                return
              }

              if (!user) return

              const updatedUserInfo: User = {
                ...user,
                finishedRegisterStep: index,
              }

              setUser(updatedUserInfo)
            }}
          />
        ))}
      </Steps>
    </div>
  )
}

export default FriendRoad
