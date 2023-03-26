import React from "react"
import { Tabs } from "antd"
import { useSetDetailContext } from "../contexts/SetDetailContext"
import { CardItem } from "./CardItem"
import { i18n } from "@/common/consts/constants"

const { TabPane } = Tabs

const LearningActivities = () => {
  const { setInfo } = useSetDetailContext()

  if (!setInfo) {
    return <></>
  }

  return (
    <div className="set-detail--learning-activities pad-16px">
      <Tabs tabPosition="left">
        <TabPane tab={i18n("learning_activities_review")} key="1">
          <CardItem />
        </TabPane>
      </Tabs>
    </div>
  )
}

export default LearningActivities
