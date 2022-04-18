import * as React from "react"

import { useHistory } from "react-router-dom"
import { useGlobalContext } from "@/common/contexts/GlobalContext"

import { UserProfileContext } from "./contexts/UserProfileContext"
import { Divider, Layout, List, notification, Result, Skeleton, Typography } from "antd"

import { AppPages, InteractionCreate, InteractionLike, InteractionSubscribe } from "@/common/consts/constants"
import UserProfileSider from "./components/UserProfileSider"
import { SetInfo, User } from "@/common/types/types"
import { getUserInfo, getUserInteractionSets } from "@/common/repo/user"
import SetItemCardLong from "@/pages/app/components/SetItemCardLong"
import { formatString } from "@/common/utils/stringUtils"
import InfiniteScroll from "react-infinite-scroll-component"
import shibaEmptyBoxIcon from "@img/emojis/shiba/box.png"

const { Content } = Layout

const { useState, useEffect } = React

const i18n = chrome.i18n.getMessage

const UserProfilePage = (props: any) => {
  const history = useHistory()
  const { user, http } = useGlobalContext()
  const [profileUser, setProfileUser] = useState<User>()
  const [sets, setSets] = useState<SetInfo[]>([])
  const [selectedTab, setSelectedTab] = useState<string>("subscribed")
  const [skip, setSkip] = useState<number>()
  const [isSearching, setIsSearching] = useState<boolean>(true)
  const [totalSetsCount, setTotalSetsCount] = useState<number>()

  const limitItemsPerGet = 5

  const tabToInteractionMap: { [interaction: string]: string } = {
    subscribed: InteractionSubscribe,
    liked: InteractionLike,
    created: InteractionCreate,
  }

  let userId = props.match?.params?.userId

  function onPageLoaded() {
    if (!http) return

    setUserInfo()
  }

  function onTabChanged(selectedTab: string) {
    setSelectedTab(selectedTab)
    resetStates()
  }

  function resetStates() {
    setSkip(0)
    setTotalSetsCount(0)
    setIsSearching(false)
    setSets([])
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

    setIsSearching(true)

    const interaction = tabToInteractionMap[selectedTab]
    getUserInteractionSets(http, profileUser._id, interaction, skip || 0, limitItemsPerGet)
      .then((resp) => {
        setIsSearching(false)

        !totalSetsCount && setTotalSetsCount(resp.total)
        setSkip(sets.length + resp.sets.length)
        setSets([...sets, ...resp.sets.map((s) => s.set)])
      })
      .catch(() => {
        notification["error"]({
          message: chrome.i18n.getMessage("error"),
          description: chrome.i18n.getMessage("unexpected_error_message"),
          duration: null,
        })
      })
  }

  const isElementAtBottom = (target: HTMLElement, threshold: number = 0.8) => {
    if (target.nodeName === "#document") target = document.documentElement

    const clientHeight =
      target === document.body || target === document.documentElement ? window.screen.availHeight : target.clientHeight

    return target.scrollTop + clientHeight >= threshold * target.scrollHeight
  }

  const hasMore = () => !!totalSetsCount && sets.length < totalSetsCount

  function onSetsListScroll(e: MouseEvent) {
    if (hasMore() && isElementAtBottom(e.target as HTMLElement) && !isSearching) {
      setSetsInfo()
    }
  }

  useEffect(() => {
    user && onPageLoaded()
  }, [http, user])
  useEffect(() => profileUser && setSetsInfo(), [selectedTab, profileUser])

  return (
    <UserProfileContext.Provider value={{ user: profileUser, onTabChanged }}>
      <Layout className="body-content">
        <UserProfileSider width={250} path={""} />
        <Layout style={{ paddingLeft: 24, marginTop: -12 }}>
          <Content>
            {totalSetsCount ? (
              <InfiniteScroll
                next={() => {}}
                dataLength={totalSetsCount}
                hasMore={hasMore()}
                loader={<Skeleton avatar paragraph={{ rows: 3 }} active />}
                endMessage={<Divider plain>{i18n("common_end_list_result")}</Divider>}
                onScroll={onSetsListScroll}
              >
                <List
                  dataSource={sets}
                  renderItem={(set) => (
                    <List.Item key={set._id}>
                      <SetItemCardLong set={set} />
                    </List.Item>
                  )}
                />
              </InfiniteScroll>
            ) : isSearching ? (
              <Skeleton avatar paragraph={{ rows: 3 }} active />
            ) : (
              <Result icon={<img src={shibaEmptyBoxIcon} />} title={i18n("common_not_found")}>
                <Typography.Paragraph>
                  {formatString(i18n("search_result_not_found"), [
                    {
                      key: "keyword",
                      value: props.keyword,
                    },
                  ])}
                </Typography.Paragraph>
              </Result>
            )}
          </Content>
        </Layout>
      </Layout>
    </UserProfileContext.Provider>
  )
}

export default UserProfilePage
