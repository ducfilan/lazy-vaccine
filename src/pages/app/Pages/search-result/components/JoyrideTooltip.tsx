import { ColorWhite } from "@/common/consts/constants"
import { Button } from "antd"
import React from "react"

import { TooltipRenderProps } from "react-joyride"

export const JoyrideTooltip = ({
  continuous,
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  tooltipProps,
}: TooltipRenderProps) => (
  <div {...tooltipProps} style={{ background: ColorWhite, padding: 10, borderRadius: 5, textAlign: "center" }}>
    {step.title && step.title}
    {step.content}
    <div
      style={{
        padding: 10,
        paddingBottom: 0,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        columnGap: 10,
      }}
    >
      {index > 0 && (
        <Button
          type="primary"
          size="large"
          {...backProps}
          style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", textTransform: "uppercase" }}
        >
          {backProps.title}
        </Button>
      )}
      {continuous && (
        <Button
          type="primary"
          size="large"
          {...primaryProps}
          style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", textTransform: "uppercase" }}
        >
          {primaryProps.title}
        </Button>
      )}
      {!continuous && (
        <Button
          type="primary"
          size="large"
          {...closeProps}
          style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", textTransform: "uppercase" }}
        >
          {closeProps.title}
        </Button>
      )}
    </div>
  </div>
)
