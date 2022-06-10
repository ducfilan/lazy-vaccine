import * as React from "react"
import { Divider, Layout, Typography, Menu } from "antd"
import { AimOutlined, LikeFilled, FormOutlined, TrophyOutlined } from "@ant-design/icons"

import { useUserProfileContext } from "../contexts/UserProfileContext"
import AvatarImage from "@/common/components/AvatarImage"

const { Title } = Typography
const { Sider } = Layout
const i18n = chrome.i18n.getMessage

const UserProfileSider = (props: { width: number; path: string }) => {
  const { user, onTabChanged } = useUserProfileContext()

  if (!user) {
    return <></>
  }

  return (
    <Sider width={props.width} className="user-profile-sider--wrapper pad-16px">
      <div className="has-text-centered">
        <AvatarImage imageUrl={user.pictureUrl} size={props.width / 2} fallbackCharacter={`${user.name}?`[0]} />
        <Title level={4}>{user.name}</Title>
      </div>
      <Divider />
      <Menu
        defaultSelectedKeys={["myAchievement"]}
        onClick={({ key }) => {
          onTabChanged(key)
        }}
        items={[
          {
            key: "myAchievement",
            icon: <TrophyOutlined />,
            label: i18n("my_space_achievement"),
          },
          {
            key: "subscribed",
            icon: <AimOutlined />,
            label: i18n("common_subscribed"),
          },
          {
            key: "liked",
            icon: <LikeFilled />,
            label: i18n("common_liked"),
          },
          {
            key: "created",
            icon: <FormOutlined />,
            label: i18n("common_created"),
          },
        ]}
      />
    </Sider>
  )
}

export default UserProfileSider
