import React from "react"

import Joyride, { ACTIONS, CallBackProps, EVENTS, STATUS } from "react-joyride"
import parse from "html-react-parser"
import UsingImg from "@img/ui/using.gif"
import { JoyrideTooltip } from "./JoyrideTooltip"

import { i18n } from "@/common/consts/constants"

const GettingStartedJoyride = ({ callback }: { callback: Function }) => {
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      callback()
    }
  }

  return (
    <Joyride
      continuous
      disableCloseOnEsc
      disableOverlayClose
      disableScrolling
      locale={{
        back: i18n("common_back"),
        close: i18n("common_close"),
        next: i18n("common_next"),
        skip: i18n("common_skip"),
        last: i18n("common_understand"),
        open: "",
      }}
      steps={[
        {
          target: ".ant-list-item .ant-card",
          content: (
            <div>
              <h3 style={{ fontSize: 18, whiteSpace: "pre-line" }} className="joyride-content--title">
                {parse(i18n("getting_started_guide_subscribe"))}
              </h3>
              <img src={UsingImg} />
            </div>
          ),
          disableBeacon: true,
        },
      ]}
      styles={{
        options: {
          width: 650,
        },
      }}
      tooltipComponent={JoyrideTooltip}
      callback={handleJoyrideCallback}
    />
  )
}

export default GettingStartedJoyride
