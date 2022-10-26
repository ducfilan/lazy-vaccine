import React from "react"

import { Popover, Steps, StepsProps } from "antd"
import "./css/friend-road.scss"
import TailImg from "@img/emojis/shiba/tail.png"
import ImagePin from "./ImagePin"
import { useGlobalContext } from "@/common/contexts/GlobalContext"

const { Step } = Steps

const FriendRoad = (props: { steps: { title: string; description: string }[] }) => {
  const { user } = useGlobalContext()

  return (
    user && (
      <div className="friend-road--wrapper">
        <div className="images-pins--wrapper">
          <ImagePin
            style={{ marginLeft: `${(user?.finishedRegisterStep || 0) * 206}px` }}
            imgUrl={user?.pictureUrl}
            imgStyle={{ width: 80, left: 10, top: 10 }}
          />
          <ImagePin
            style={{
              position: "absolute",
              right: 20,
              bottom: 10,
            }}
            imgUrl={TailImg}
            imgStyle={{ width: 90, left: 5, borderRadius: 0 }}
          />
        </div>
        <Steps progressDot current={user.finishedRegisterStep}>
          {props.steps.map((step) => (
            <Step title={step.title} description={step.description} />
          ))}
        </Steps>
      </div>
    )
  )
}

export default FriendRoad
