import * as React from "react"

import { PageHeader, Menu, Dropdown, Button, Avatar, Image } from "antd"
import { MenuOutlined, RightCircleOutlined } from "@ant-design/icons"

import logo from "@img/ui/logo.png"

import { signOut } from "@facades/authFacade"
import { usePopupContext } from "@/pages/popup/contexts/PopupContext"

const DropdownMenu = (props: { isLoggedIn: boolean }) => {
  const { user, setUser } = usePopupContext()

  return (
    <Dropdown
      overlay={
        <Menu>
          {props.isLoggedIn && (
            <>
              <Menu.Item key="name"><RightCircleOutlined /> {user?.name}</Menu.Item>
              <Menu.Divider />
              <Menu.Item key="logout">
                <Button
                  type="link"
                  onClick={() => {
                    signOut(() => {
                      setUser(null)
                    })
                  }}
                >
                  {chrome.i18n.getMessage("logout")}
                </Button>
              </Menu.Item>
            </>
          )}
        </Menu>
      }
      overlayStyle={{
        minWidth: 120,
      }}
      arrow
      placement="bottomRight"
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

function AvatarImage(props: { isLoggedIn: boolean }) {
  if (!props.isLoggedIn) return <></>

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
      extra={[
        <AvatarImage key="avatar" isLoggedIn={props.isLoggedIn} />,
        <DropdownMenu key="menu" isLoggedIn={props.isLoggedIn} />,
      ]}
    />
  )
}

export default Navbar
