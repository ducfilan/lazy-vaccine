import * as React from "react"

import { PageHeader, Menu, Dropdown, Button } from "antd"
import { MenuOutlined, RightCircleOutlined } from "@ant-design/icons"

import AppLogo from "@img/ui/logo.png"

import { signOut } from "@facades/authFacade"
import { useGlobalContext } from "@/common/contexts/GlobalContext"
import AvatarImage from "./AvatarImage"
import { AppBasePath, AppPages, i18n } from "@consts/constants"

const DropdownMenu = (props: { isLoggedIn: boolean; target?: string }) => {
  const { user, setUser, setHttp } = useGlobalContext()

  return props.isLoggedIn ? (
    <Dropdown
      overlay={
        <Menu
          items={[
            {
              key: "name",
              icon: <RightCircleOutlined />,
              label: (
                <a href={`${chrome.runtime.getURL(AppBasePath)}${AppPages.MySpace.path}`} target={props.target || ""}>
                  {user?.name}
                </a>
              ),
            },
            {
              key: "logout",
              label: (
                <Button
                  type="link"
                  onClick={() => {
                    signOut(() => {
                      setUser(undefined)
                      setHttp(undefined)
                    })
                  }}
                >
                  {i18n("logout")}
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

function Navbar(props: { extraComponents?: React.ReactNode[]; centerComponent?: React.ReactNode; target?: string }) {
  const { user } = useGlobalContext()
  const isLoggedIn = !!user

  return (
    <PageHeader
      title={
        <a
          key={AppPages.Home.path}
          href={`${chrome.runtime.getURL(AppBasePath)}${AppPages.Home.path}`}
          style={{ color: "white" }}
          target={props.target || ""}
        >
          {i18n("appName")}
        </a>
      }
      avatar={{ gap: 0, src: AppLogo, size: 48 }}
      extra={[
        ...(props.extraComponents || []),
        isLoggedIn ? (
          <a
            key={AppPages.MySpace.path}
            href={`${chrome.runtime.getURL(AppBasePath)}${AppPages.MySpace.path}`}
            target={props.target || ""}
          >
            <AvatarImage key="avatar" imageUrl={user?.pictureUrl} />
          </a>
        ) : (
          <div key="avatar"></div>
        ),
        <DropdownMenu key="menu" isLoggedIn={isLoggedIn} target={props.target} />,
      ]}
    >
      {props.centerComponent}
    </PageHeader>
  )
}

export default Navbar
