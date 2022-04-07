import * as React from "react"
import { Divider, Layout, Typography, Menu } from "antd"
import { AimOutlined, LikeFilled, FormOutlined } from "@ant-design/icons"

import { useUserProfileContext } from "../contexts/UserProfileContext"
import Avatar from "react-avatar"

const { Title } = Typography
const { Sider } = Layout
const i18n = chrome.i18n.getMessage

const UserProfileSider = (props: { width: number; path: string }) => {
  const { user, setSelectedTab } = useUserProfileContext()

  if (!user) {
    return <></>
  }

  return (
    <Sider width={props.width} className="user-profile-sider--wrapper pad-16px">
      <div className="has-text-centered">
        <Avatar src={user.pictureUrl} size={`${props.width / 2}`} round={true} name={user.name} textSizeRatio={1.75} />
        <Title level={4}>{user.name}</Title>
      </div>
      <Divider />
      <Menu
        defaultSelectedKeys={["subscribed"]}
        onClick={({ key }) => {
          setSelectedTab(key)
        }}
      >
        <Menu.Item key="subscribed" icon={<AimOutlined />}>
          {i18n("common_subscribed")}
        </Menu.Item>
        <Menu.Item key="liked" icon={<LikeFilled />}>
          {i18n("common_liked")}
        </Menu.Item>
        <Menu.Item key="created" icon={<FormOutlined />}>
          {i18n("common_created")}
        </Menu.Item>
      </Menu>
    </Sider>
  )
}

export default UserProfileSider
