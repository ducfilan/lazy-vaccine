import * as React from "react"

import { useHistory } from "react-router-dom"
import { useGlobalContext } from "@/common/contexts/GlobalContext"

import { UserProfileContext } from "./contexts/UserProfileContext"
import { Layout, List, notification, Skeleton } from "antd"

import { AppPages, InteractionCreate, InteractionLike, InteractionSubscribe } from "@/common/consts/constants"
import UserProfileSider from "./components/UserProfileSider"
import { SetInfo, User } from "@/common/types/types"
import { getUserInfo, getUserInteractionSets } from "@/common/repo/user"
import SetItemCardLong from "@/pages/app/components/SetItemCardLong"

const { Content } = Layout

const { useState, useEffect } = React

const i18n = chrome.i18n.getMessage

const UserProfilePage = (props: any) => {
  const history = useHistory()
  const { user, http } = useGlobalContext()
  const [profileUser, setProfileUser] = useState<User>()
  const [sets, setSets] = useState<SetInfo[]>([])
  const [selectedTab, setSelectedTab] = useState<string>("subscribed")

  const tabToInteractionMap: { [interaction: string]: string } = {
    subscribed: InteractionSubscribe,
    liked: InteractionLike,
    created: InteractionCreate,
  }

  let userId = props.match?.params?.userId

  const [loading, setLoading] = useState<boolean>(true)

  function onPageLoaded() {
    if (!http) return

    setUserInfo()
  }

  function setUserInfo() {
    if (!userId) {
      if (!user) {
        history.push(AppPages.Home.path)
        return
      }

      setProfileUser(user)
    } else {
      if (!http) return

      getUserInfo(http, userId)
        .then(setProfileUser)
        .catch(() => {
          notification["error"]({
            message: chrome.i18n.getMessage("error"),
            description: chrome.i18n.getMessage("unexpected_error_message"),
            duration: null,
          })
        })
    }
  }

  function setSetsInfo() {
    if (!http || !profileUser || !selectedTab) return

    const interaction = tabToInteractionMap[selectedTab]
    setSets([])
    getUserInteractionSets(http, profileUser._id, interaction)
      .then(setSets)
      .catch(() => {
        notification["error"]({
          message: chrome.i18n.getMessage("error"),
          description: chrome.i18n.getMessage("unexpected_error_message"),
          duration: null,
        })
      })
  }

  useEffect(() => {
    user && onPageLoaded()
  }, [http, user])
  useEffect(() => profileUser && setLoading(false), [profileUser])
  useEffect(() => profileUser && setSetsInfo(), [selectedTab, profileUser])

  return (
    <UserProfileContext.Provider value={{ user: profileUser, setSelectedTab }}>
      <Skeleton active loading={loading}>
        <Layout className="body-content">
          <UserProfileSider width={250} path={""} />
          <Layout style={{ paddingLeft: 24, marginTop: -12 }}>
            <Content>
              <Content>
                {sets && sets.length ? (
                  <List
                    itemLayout="horizontal"
                    dataSource={sets}
                    renderItem={(set) => (
                      <List.Item>
                        <SetItemCardLong set={set} key={set._id} />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Skeleton active />
                )}
              </Content>
            </Content>
          </Layout>
        </Layout>
      </Skeleton>
    </UserProfileContext.Provider>
  )
}

export default UserProfilePage
