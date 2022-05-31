import * as React from "react"

import { useHistory } from "react-router-dom"
import { useGlobalContext } from "@/common/contexts/GlobalContext"

import { UserProfileContext } from "./contexts/UserProfileContext"
import { Card, Col, Divider, Layout, List, notification, Result, Row, Skeleton, Statistic, Typography } from "antd"

import {
  AchievementChartOrderIndex,
  AppPages,
  i18n,
  InteractionCreate,
  InteractionLike,
  InteractionSubscribe,
} from "@/common/consts/constants"
import UserProfileSider from "./components/UserProfileSider"
import { SetInfo, User } from "@/common/types/types"
import { getUserInfo, getUserInteractionSets, getUserStatistics, getSetsStatistics } from "@/common/repo/user"
import SetItemCardLong from "@/pages/app/components/SetItemCardLong"
import { formatNumber, formatString } from "@/common/utils/stringUtils"
import InfiniteScroll from "react-infinite-scroll-component"
import shibaEmptyBoxIcon from "@img/emojis/shiba/box.png"
import { isElementAtBottom } from "@/pages/content-script/domHelpers"
import Icon, { BookOutlined, OrderedListOutlined } from "@ant-design/icons"
import TreeIcon from "@img/ui/fa/tree-solid.svg"
import AchievementChart from "./components/AchievementChart"
import moment from "moment"

const { Content } = Layout

const { useState, useEffect } = React

const UserProfilePage = (props: any) => {
  const history = useHistory()
  const { user, http } = useGlobalContext()
  const [profileUser, setProfileUser] = useState<User>()
  const [sets, setSets] = useState<SetInfo[]>([])
  const [selectedTab, setSelectedTab] = useState<string>("myAchievement")
  const [skip, setSkip] = useState<number>()
  const [isSearching, setIsSearching] = useState<boolean>(true)
  const [totalSetsCount, setTotalSetsCount] = useState<number>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [userStatistics, setUserStatistics] = useState<any>()
  const [setsStatistics, setSetsStatistics] = useState<any>()

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
            message: i18n("error"),
            description: i18n("unexpected_error_message"),
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
          message: i18n("error"),
          description: i18n("unexpected_error_message"),
          duration: null,
        })
      })
  }

  const hasMore = () => !!totalSetsCount && sets.length < totalSetsCount

  function onSetsListScroll(e: MouseEvent) {
    if (hasMore() && isElementAtBottom(e.target as HTMLElement) && !isSearching) {
      setSetsInfo()
    }
  }

  async function setAchievementInfo() {
    if (!http || !profileUser || !selectedTab) return
    try {
      const endDate = Date.now()
      const sevenDaysAgo: Date = new Date(endDate - 7 * 24 * 60 * 60 * 1000)
      const [userStatistics, setStatistics] = await Promise.all([
        getUserStatistics(http, moment(sevenDaysAgo).format("YYYY-MM-DD"), moment(endDate).format("YYYY-MM-DD")),
        getSetsStatistics(http),
      ])
      let labels: string[] = [],
        datasets: any = [
          {
            label: "Learnt items",
            backgroundColor: "#36AE7C",
            data: [],
          },
          {
            label: "Incorrect items",
            backgroundColor: "#187498",
            data: [],
          },
          {
            label: "Stared items",
            backgroundColor: "#F9D923",
            data: [],
          },
        ]
      userStatistics.forEach((statistic) => {
        if (!statistic) return

        labels.push(moment(statistic.date).format("MM/DD/YYYY"))
        datasets[AchievementChartOrderIndex.LearntItems].data.push(statistic.interactions.show || 0)
        datasets[AchievementChartOrderIndex.IncorrectItems].data.push(
          statistic.interactions.incorrect || Math.floor(statistic.interactions.show / 4) // TODO: Hard-code, fix the logic.
        )
        datasets[AchievementChartOrderIndex.StaredItems].data.push(statistic.interactions.star || 0)
      })

      setUserStatistics({ labels, datasets })
      setSetsStatistics(setStatistics)
    } catch (error) {
      notification["error"]({
        message: i18n("error"),
        description: i18n("unexpected_error_message"),
        duration: null,
      })
    }
  }

  useEffect(() => {
    user && onPageLoaded()
  }, [http, user])
  useEffect(() => {
    profileUser && (selectedTab !== "myAchievement" ? setSetsInfo() : setAchievementInfo())
  }, [selectedTab, profileUser])

  return (
    <UserProfileContext.Provider value={{ user: profileUser, onTabChanged }}>
      <Layout className="body-content">
        <UserProfileSider width={250} path={""} />
        <Layout style={{ paddingLeft: 24, marginTop: -12 }}>
          <Content>
            {selectedTab === "myAchievement" ? (
              <div className="top-12px">
                {setsStatistics && (
                  <Card hoverable loading={isLoading} className="completed-info--stats ">
                    <Row gutter={[16, 0]}>
                      <Col className="gutter-row" span={8}>
                        <Statistic
                          title={i18n("popup_stats_sets")}
                          value={setsStatistics?.subscribedSetsCount}
                          prefix={<BookOutlined />}
                        />
                      </Col>
                      <Col className="gutter-row" span={8}>
                        <Statistic
                          title={i18n("common_items")}
                          value={setsStatistics?.learntItemsCount}
                          prefix={<OrderedListOutlined />}
                          suffix={`/ ${formatNumber(setsStatistics?.totalItemsCount)}`}
                        />
                      </Col>
                      {/* TODO: remove mock tree data */}
                      <Col className="gutter-row" span={8}>
                        <Statistic
                          title={i18n("popup_stats_trees_plant")}
                          value={2}
                          prefix={<Icon component={TreeIcon} />}
                        />
                      </Col>
                    </Row>
                  </Card>
                )}
                {userStatistics && (
                  <>
                    <Typography.Title level={3} className="top-8px">
                      {i18n("my_space_how_changed")}
                    </Typography.Title>
                    <AchievementChart statistics={userStatistics} />
                  </>
                )}
              </div>
            ) : totalSetsCount ? (
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
