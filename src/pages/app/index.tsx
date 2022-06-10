import * as React from "react"
import { createRoot } from "react-dom/client"
import { HashRouter } from "react-router-dom"
import "antd/dist/antd.less"

import AppPage from "./App"

const mountNode = document.getElementById("root")
const root = createRoot(mountNode!)
root.render(
  <HashRouter>
    <AppPage />
  </HashRouter>
)
