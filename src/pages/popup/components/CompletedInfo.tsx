import React, { useEffect, useState } from "react"

import { useGlobalContext } from "@/common/contexts/GlobalContext"

import { Row, Col, Badge, Typography, Card, Statistic, Button, notification, Input } from "antd"
import Icon, {
  BookOutlined,
  OrderedListOutlined,
  SettingOutlined,
  FileSearchOutlined,
  BarChartOutlined,
  SmileOutlined,
  RocketOutlined,
} from "@ant-design/icons"

import { GeneralInfoCounts, User } from "@/common/types/types"
import RegisterSteps from "@/common/consts/registerSteps"
import { getGeneralInfoCounts, getLearningProgressInfo, updateUserInfo } from "@/common/repo/user"
import { formatNumber } from "@/common/utils/stringUtils"

import NextPrevButton from "./NextPrevButton"
import PopupHeader from "./Header"
import AvatarImage from "@/common/components/AvatarImage"
import TreeIcon from "@img/ui/fa/tree-solid.svg"
import { AchievementChartOrderIndex, AppBasePath, AppPages, i18n } from "@/common/consts/constants"
import moment from "moment"
import AchievementChart from "@/pages/app/Pages/user-profile/components/AchievementChart"

const { Text } = Typography

const HomePageUrl = `${chrome.runtime.getURL(AppBasePath)}/home`
const MySpacePageUrl = `${chrome.runtime.getURL(AppBasePath)}${AppPages.MySpace.path}`

function HeaderContent(props: { setsStatistics: any }) {
  const { user } = useGlobalContext()
  const isLoading = !user

  return (
    <Row gutter={32}>
      <Col flex="96px">
        <Badge.Ribbon
          text={
            <Text style={{ width: 96 }} ellipsis={{ tooltip: user?.name }}>
              {user?.name}
            </Text>
          }
          color="white"
          className="has-text-centered"
        >
          <AvatarImage size={96} imageUrl={user?.pictureUrl} />
        </Badge.Ribbon>
      </Col>
      <Col flex="auto">
        <Card hoverable loading={isLoading} className="completed-info--stats">
          <Row gutter={[16, 0]}>
            <Col className="gutter-row" span={6}>
              <Statistic
                title={i18n("popup_stats_sets")}
                value={props.setsStatistics?.subscribedSetsCount}
                prefix={<BookOutlined />}
              />
            </Col>
            <Col className="gutter-row" span={12}>
              <Statistic
                title={i18n("common_items")}
                value={props.setsStatistics?.learntItemsCount}
                prefix={<OrderedListOutlined />}
                suffix={`/ ${formatNumber(props.setsStatistics?.totalItemsCount)}`}
              />
            </Col>
            <Col className="gutter-row" span={6}>
              {/* TODO: remove mock tree data */}
              <Statistic title={i18n("popup_stats_trees_plant")} value={2} prefix={<Icon component={TreeIcon} />} />
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  )
}

function CompletedInfo() {
  const { user, setUser, http } = useGlobalContext()
  const [generalInfoCounts, setGeneralInfoCounts] = useState<GeneralInfoCounts>()
  const [learningProgressInfo, setLearningProgressInfo] = useState<any>()

  useEffect(() => {
    user && getSetsStatisticsInfo()
  }, [http, user])

  const getSetsStatisticsInfo = async () => {
    if (!http) return

    try {
      const endDate = Date.now()
      const sevenDaysAgo: Date = new Date(endDate - 7 * 24 * 60 * 60 * 1000)
      const learningProgressInfoRaw = await getLearningProgressInfo(
        http,
        moment(sevenDaysAgo).format("YYYY-MM-DD"),
        moment(endDate).format("YYYY-MM-DD")
      )
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
      learningProgressInfoRaw.forEach((statistic) => {
        if (!statistic) return

        labels.push(moment(statistic.date).format("MM/DD/YYYY"))
        datasets[AchievementChartOrderIndex.LearntItems].data.push(statistic.interactions.correct || 0)
        datasets[AchievementChartOrderIndex.IncorrectItems].data.push(statistic.interactions.incorrect || 0)
        datasets[AchievementChartOrderIndex.StaredItems].data.push(statistic.interactions.star || 0)
      })

      setLearningProgressInfo({ labels, datasets })
      setGeneralInfoCounts(await getGeneralInfoCounts(http))
    } catch (error) {
      notification["error"]({
        message: i18n("error"),
        description: i18n("unexpected_error_message"),
        duration: null,
      })
    }
  }

  const goBack = async () => {
    const prevStep = user ? RegisterSteps.prev(user.finishedRegisterStep) : null
    prevStep && (await goToStep(prevStep))
  }

  const goToStep = async (step: number) => {
    try {
      if (!user) return

      const updatedUserInfo: User = {
        ...user,
        finishedRegisterStep: step,
      }

      http && (await updateUserInfo(http, { finishedRegisterStep: step }))

      setUser(updatedUserInfo)
    } catch (error) {
      // TODO: Handle more types of error: Server/Timeout/Network etc..
      notification["error"]({
        message: i18n("error"),
        description: i18n("unexpected_error_message"),
        duration: null,
      })
    }
  }

  return (
    <div className="completed-info--wrapper">
      {generalInfoCounts && (
        <>
          <PopupHeader content={<HeaderContent setsStatistics={generalInfoCounts} />} />
          <div className="completed-info--pages-list">
            <NextPrevButton direction={"left"} onPrev={goBack} />
            <Row gutter={[32, 16]} className="completed-info--button-list">
              <Col span={12}>
                <Button
                  className="completed-info--button-more-sets"
                  size="large"
                  icon={<FileSearchOutlined />}
                  block
                  href={HomePageUrl}
                  target="_blank"
                >
                  {i18n("popup_stats_more_sets")}
                </Button>
              </Col>
              <Col span={12}>
                <Button
                  key="create-set"
                  size="large"
                  className="completed-info--button-create-set"
                  icon={<RocketOutlined />}
                  block
                  onClick={() =>
                    window.open(`${chrome.runtime.getURL(AppBasePath)}${AppPages.CreateSet.path}`, "_blank")
                  }
                >
                  {i18n("create_set_button")}
                </Button>
              </Col>
              {/* TODO: update full-stats, setting */}
              <Col span={12} style={{ display: "none" }}>
                <Button className="completed-info--button-full-stats" size="large" icon={<BarChartOutlined />} block>
                  {i18n("popup_stats_full_stats")}
                </Button>
              </Col>
              <Col span={12} style={{ display: "none" }}>
                <Button className="completed-info--button-settings" size="large" icon={<SettingOutlined />} block>
                  {i18n("popup_stats_settings")}
                </Button>
              </Col>
              <Input.Search
                placeholder={i18n("suggestion_card_search_placeholder")}
                style={{ padding: "0 16px" }}
                enterButton
                onSearch={(keyword) => {
                  window.open(
                    `${chrome.runtime.getURL(AppBasePath)}${AppPages.Sets.path}?keyword=${encodeURIComponent(keyword)}`,
                    "_blank"
                  )
                }}
              />
            </Row>
          </div>
        </>
      )}
      {learningProgressInfo && (
        <div className="chart-wrapper">
          <AchievementChart statistics={learningProgressInfo} />
        </div>
      )}
    </div>
  )
}

export default CompletedInfo
