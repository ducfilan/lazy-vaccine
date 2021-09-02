import * as React from "react"
import { Layout, Typography } from "antd"

const { Title } = Typography
const { Sider } = Layout

import { AppPages } from "@/common/consts/constants"
import { Link } from "react-router-dom"

const Sidebar = (props: { width: number }) => {
  return (
    <Sider width={props.width} className="navbar-sides--wrapper">
      <ul>
        {Object.values(AppPages).map((page) => (
          <li key={page.key}>
            <Link to={page.path}>
              <Title level={4}>{page.name}</Title>
            </Link>
          </li>
        ))}
      </ul>
    </Sider>
  )
}

export default Sidebar
