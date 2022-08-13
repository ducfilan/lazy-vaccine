import * as React from "react"
import { Divider, Layout, Typography, Menu, Button } from "antd"
import { AimOutlined, LikeFilled, FormOutlined, TrophyOutlined, SettingOutlined } from "@ant-design/icons"

import { useUserProfileContext } from "../contexts/UserProfileContext"
import AvatarImage from "@/common/components/AvatarImage"
import {
  i18n,
  UserProfileTabCreated,
  UserProfileTabLiked,
  UserProfileTabMyAchievements,
  UserProfileTabSettingPages,
  UserProfileTabSubscribed,
} from "@/common/consts/constants"

const { Title } = Typography
const { Sider } = Layout

const UserProfileSider = (props: { width: number; path: string }) => {
  const { user, onTabChanged } = useUserProfileContext()

  if (!user) {
    return <></>
  }

  return (
    <Sider width={props.width} className="user-profile-sider--wrapper pad-16px">
      <Button
        shape="circle"
        size="small"
        icon={<SettingOutlined />}
        style={{ position: "absolute", top: 10, right: 10 }}
        onClick={() => onTabChanged(UserProfileTabSettingPages)}
      />
      <div className="has-text-centered">
        <AvatarImage imageUrl={user.pictureUrl} size={props.width / 2} fallbackCharacter={`${user.name}?`[0]} />
        <Title level={4}>{user.name}</Title>
      </div>
      <Divider />
      <Menu
        defaultSelectedKeys={[UserProfileTabMyAchievements]}
        onClick={({ key }) => {
          onTabChanged(key)
        }}
        items={[
          {
            key: UserProfileTabMyAchievements,
            icon: <TrophyOutlined />,
            label: i18n("my_space_achievement"),
          },
          {
            key: UserProfileTabSubscribed,
            icon: <AimOutlined />,
            label: i18n("common_subscribed"),
          },
          {
            key: UserProfileTabLiked,
            icon: <LikeFilled />,
            label: i18n("common_liked"),
          },
          {
            key: UserProfileTabCreated,
            icon: <FormOutlined />,
            label: i18n("common_created"),
          },
        ]}
      />
    </Sider>
  )
}

export default UserProfileSider
