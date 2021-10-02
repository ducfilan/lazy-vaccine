import * as React from "react"
import { Layout, Menu, Typography } from "antd"

const { Title } = Typography
const { Header } = Layout

import { AppPages } from "@/common/consts/constants"
import { Link } from "react-router-dom"

const PagesNavigator = (props: { path: string }) => {
  return (
    <Header className="pages-navigator--wrapper">
      <Menu mode="horizontal">
        {Object.values(AppPages)
          .filter((page) => page.isSideNav)
          .map((page) => (
            <Menu.Item key={page.key} className={page.path === props.path ? "is-active" : ""}>
              <Link to={page.path}>
                <Title level={4}>{page.name}</Title>
              </Link>
            </Menu.Item>
          ))}
      </Menu>
    </Header>
  )
}

export default PagesNavigator
