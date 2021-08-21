import * as React from "react"

import { Spin } from "antd"

import shibaGoodMorningIcon from "@img/emojis/shiba/gm.png"

function Loading() {
  return (
    <Spin
      style={{
        position: "absolute",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
        paddingBottom: "100px",
      }}
      indicator={
        <img
          src={shibaGoodMorningIcon}
          style={{
            width: "auto",
            height: "auto",
            fontSize: "169px",
          }}
        />
      }
    />
  )
}

export default Loading
