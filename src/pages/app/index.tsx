import * as React from "react"
import { render } from "react-dom"
import { HashRouter } from "react-router-dom"
import "antd/dist/antd.less"

import AppPage from "./App"

var mountNode = document.getElementById("root")
render(
  <HashRouter>
    <AppPage />
  </HashRouter>,
  mountNode
)
