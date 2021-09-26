import * as React from "react"

import { useGlobalContext } from "@/common/contexts/GlobalContext"

import { Row, Col, Badge, Typography, Card, Statistic, Button, notification } from "antd"
import Icon, {
  BookOutlined,
  OrderedListOutlined,
  SettingOutlined,
  FileSearchOutlined,
  BarChartOutlined,
  SmileOutlined,
} from "@ant-design/icons"

import { User } from "@/common/types/types"
import RegisterSteps from "@/common/consts/registerSteps"
import { updateUserInfo } from "@/common/api/user"
import { formatNumber } from "@/common/utils/stringUtils"

import NextPrevButton from "./NextPrevButton"
import PopupHeader from "./Header"
import AvatarImage from "@/common/components/AvatarImage"
import TreeIcon from "@img/ui/fa/tree-solid.svg"

const { Text } = Typography

const { useState } = React

function HeaderContent() {
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
              <Statistic title={chrome.i18n.getMessage("popup_stats_sets")} value={1128} prefix={<BookOutlined />} />
            </Col>
            <Col className="gutter-row" span={12}>
              <Statistic
                title={chrome.i18n.getMessage("common_items")}
                value={2502}
                prefix={<OrderedListOutlined />}
                suffix={`/ ${formatNumber(13212)}`}
              />
            </Col>
            <Col className="gutter-row" span={6}>
              <Statistic
                title={chrome.i18n.getMessage("popup_stats_trees_plant")}
                value={32}
                prefix={<Icon component={TreeIcon} />}
              />
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  )
}

function CompletedInfo() {
  const { user, setUser, http } = useGlobalContext()

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
        message: chrome.i18n.getMessage("error"),
        description: chrome.i18n.getMessage("unexpected_error_message"),
      })
    }
  }

  return (
    <div className="completed-info--wrapper">
      <PopupHeader content={<HeaderContent />} />

      <div className="completed-info--pages-list">
        <NextPrevButton direction={"left"} onPrev={goBack} />

        <Row gutter={[32, 16]} className="completed-info--button-list">
          <Col span={12}>
            <Button className="completed-info--button-more-sets" size="large" icon={<FileSearchOutlined />} block>
              {chrome.i18n.getMessage("popup_stats_more_sets")}
            </Button>
          </Col>
          <Col span={12}>
            <Button className="completed-info--button-full-stats" size="large" icon={<BarChartOutlined />} block>
              {chrome.i18n.getMessage("popup_stats_full_stats")}
            </Button>
          </Col>
          <Col span={12}>
            <Button className="completed-info--button-my-profile" size="large" icon={<SmileOutlined />} block>
              {chrome.i18n.getMessage("popup_stats_my_profile")}
            </Button>
          </Col>
          <Col span={12}>
            <Button className="completed-info--button-settings" size="large" icon={<SettingOutlined />} block>
              {chrome.i18n.getMessage("popup_stats_settings")}
            </Button>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default CompletedInfo
