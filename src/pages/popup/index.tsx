import * as React from "react"
import { createRoot } from "react-dom/client"
import "antd/dist/antd.less"

import PopupPage from "./Popup"

const mountNode = document.getElementById("root")
const root = createRoot(mountNode!)
root.render(<PopupPage />)
