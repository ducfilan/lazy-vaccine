import * as React from "react"

import { PageHeader, Menu, Dropdown, Button, Avatar, Image } from "antd"
import { MenuOutlined } from "@ant-design/icons"

import logo from "@img/ui/logo.png"

import { signOut } from "@facades/authFacade"
import { usePopupContext } from "@/pages/popup/contexts/PopupContext"
import RegisterSteps from "@consts/registerSteps"
import CacheKeys from "@consts/cacheKeys"
import useLocalStorage from "@hooks/useLocalStorage"

const DropdownMenu = (props: { isLoggedIn: boolean }) => {
  const [, setFinishedRegisterStep] = useLocalStorage(CacheKeys.finishedRegisterStep)
  const { setUser } = usePopupContext()

  return (
    <Dropdown
      overlay={
        <Menu>
          {props.isLoggedIn && (
            <Menu.Item key="logout">
              <Button
                type="link"
                onClick={() => {
                  signOut(() => {
                    const finishedRegisterStep = RegisterSteps.Install

                    setFinishedRegisterStep(finishedRegisterStep)
                    setUser(null)
                  })
                }}
              >
                {chrome.i18n.getMessage("logout")}
              </Button>
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
}

function AvatarImage() {
  const { user } = usePopupContext()

  return user?.pictureUrl ? (
    <Avatar src={<Image src={user?.pictureUrl} preview={false} />} />
  ) : (
    <Avatar>{(user?.name || "?")[0]}</Avatar>
  )
}

function Navbar(props: { isLoggedIn: boolean }) {
  return (
    <PageHeader
      title={chrome.i18n.getMessage("appName")}
      avatar={{ gap: 0, src: logo, size: 48 }}
      extra={[<AvatarImage />, <DropdownMenu key="menu" isLoggedIn={props.isLoggedIn} />]}
    />
  )
}

export default Navbar
