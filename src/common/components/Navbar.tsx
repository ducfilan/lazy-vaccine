import * as React from "react"

import { PageHeader, Menu, Dropdown, Button } from "antd"
import { MenuOutlined, RightCircleOutlined } from "@ant-design/icons"

import AppLog from "@img/ui/logo.png"

import { signOut } from "@facades/authFacade"
import { useGlobalContext } from "@/pages/popup/contexts/GlobalContext"
import AvatarImage from "./AvatarImage"

const DropdownMenu = (props: { isLoggedIn: boolean }) => {
  const { user, setUser, http } = useGlobalContext()

  return (
    <Dropdown
      overlay={
        <Menu>
          {props.isLoggedIn && (
            <>
              <Menu.Item key="name">
                <RightCircleOutlined /> {user?.name}
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item key="logout">
                <Button
                  type="link"
                  onClick={() => {
                    signOut.call({ http }, () => {
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

function Navbar(props: { extraComponents?: React.ReactNode[]; centerComponent?: React.ReactNode }) {
  const { user } = useGlobalContext()
  const isLoggedIn = !!user

  return (
    <PageHeader
      title={chrome.i18n.getMessage("appName")}
      avatar={{ gap: 0, src: AppLog, size: 48 }}
      extra={[
        ...(props.extraComponents || []),
        isLoggedIn ? <AvatarImage key="avatar" imageUrl={user?.pictureUrl} /> : <div key="avatar"></div>,
        <DropdownMenu key="menu" isLoggedIn={isLoggedIn} />,
      ]}
    >
      {props.centerComponent}
    </PageHeader>
  )
}

export default Navbar
