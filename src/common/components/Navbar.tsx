import * as React from "react"

import { PageHeader, Menu, Dropdown, Button } from "antd"
import { MenuOutlined, RightCircleOutlined } from "@ant-design/icons"

import AppLogo from "@img/ui/logo.png"

import { signOut } from "@facades/authFacade"
import { useGlobalContext } from "@/common/contexts/GlobalContext"
import AvatarImage from "./AvatarImage"
import { Link } from "react-router-dom"
import { AppPages } from "@consts/constants"

const DropdownMenu = (props: { isLoggedIn: boolean }) => {
  const { user, setUser } = useGlobalContext()

  return props.isLoggedIn ? (
    <Dropdown
      overlay={
        <Menu
          items={[
            {
              key: "name",
              icon: <RightCircleOutlined />,
              label: <Link to={AppPages.MySpace.path}>{user?.name}</Link>,
            },
            {
              key: "logout",
              label: (
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
              ),
            },
          ]}
        />
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
  ) : (
    <></>
  )
}

function Navbar(props: { extraComponents?: React.ReactNode[]; centerComponent?: React.ReactNode }) {
  const { user } = useGlobalContext()
  const isLoggedIn = !!user

  return (
    <PageHeader
      title={
        <Link to={"/home"} style={{ color: "white" }}>
          {chrome.i18n.getMessage("appName")}
        </Link>
      }
      avatar={{ gap: 0, src: AppLogo, size: 48 }}
      extra={[
        ...(props.extraComponents || []),
        isLoggedIn ? (
          <AvatarImage key="avatar" imageUrl={user?.pictureUrl} link={AppPages.MySpace.path} />
        ) : (
          <div key="avatar"></div>
        ),
        <DropdownMenu key="menu" isLoggedIn={isLoggedIn} />,
      ]}
    >
      {props.centerComponent}
    </PageHeader>
  )
}

export default Navbar
