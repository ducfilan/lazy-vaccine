import * as React from "react"

import { PageHeader, Menu, Dropdown, Button } from "antd"
import { MenuOutlined } from "@ant-design/icons"

import logo from "@img/ui/logo.png"

const DropdownMenu = (props: { isLoggedIn: boolean }) => (
  <Dropdown
    overlay={
      <Menu>
        {props.isLoggedIn && (
          <Menu.Item key="logout">
            <Button type="link">{chrome.i18n.getMessage("logout")}</Button>
          </Menu.Item>
        )}
      </Menu>
    }
    overlayStyle={{
      minWidth: 120,
    }}
  >
    <Button
      type="text"
      style={{
        border: "none",
        paddingRight: 8,
      }}
    >
      <MenuOutlined
        style={{
          color: "white",
        }}
      />
    </Button>
  </Dropdown>
)

function Navbar(props: { isLoggedIn: boolean }) {
  return (
    <PageHeader
      title={chrome.i18n.getMessage("appName")}
      avatar={{ gap: 0, src: logo, size: 48 }}
      extra={[<DropdownMenu key="menu" isLoggedIn={props.isLoggedIn} />]}
    />
  )
}

export default Navbar
