import React from "react"

import { useGlobalContext } from "@/common/contexts/GlobalContext"

import { Card, Space, Checkbox, notification, Button } from "antd"
import { CheckCircleFilled } from "@ant-design/icons"

import { i18n, SupportingPages } from "@consts/constants"
import { User } from "@/common/types/types"
import { updateUserInfo } from "@/common/repo/user"

import BrandIcon from "@/common/components/BrandIcon"

const { useState } = React

function ChoosePages() {
  const { user, setUser, http } = useGlobalContext()

  const [chosePages, setChosePages] = useState<string[]>(
    user?.pages || Object.values(SupportingPages).map((p) => p.key)
  )

  const headerText = i18n("popup_introduce_choose_pages")

  const saveChanges = async () => {
    try {
      if (!user) return

      const updatedUserInfo: User = {
        ...user,
        pages: chosePages,
      }

      http && (await updateUserInfo(http, { pages: chosePages }))

      setUser(updatedUserInfo)

      notification["success"]({
        message: i18n("common_success"),
        description: i18n("user_profile_update_pages_success"),
        duration: 5,
      })
    } catch (error) {
      notification["error"]({
        message: i18n("error"),
        description: i18n("unexpected_error_message"),
        duration: null,
      })
    }
  }

  const toggleSelectPage = (page: string) => {
    if (chosePages.includes(page)) {
      setChosePages(chosePages.filter((p) => p !== page))
    } else {
      setChosePages([...chosePages, page])
    }
  }

  const selectAllPages = (e: { target: { checked: boolean } }) => {
    const isSelectAllPages = e.target.checked
    setChosePages(isSelectAllPages ? Object.keys(SupportingPages) : [])
  }

  const isPageSelected = (page: string) => chosePages.includes(page)

  return (
    <div className="choose-pages--wrapper">
      <h3 className="ant-typography top-25px">{headerText}</h3>

      <div className="choose-pages--pages-list">
        <Space align="end" style={{ marginRight: 18 }}>
          <Checkbox onChange={selectAllPages}>{i18n("select_all")}</Checkbox>
        </Space>

        <Card bordered={false}>
          {Object.entries(SupportingPages).map(([page, pageInfo]) => (
            <Card.Grid key={page} hoverable={false}>
              <div
                className={`choose-pages--page-item has-text-white has-text-centered ${page} 
                  ${isPageSelected(page) ? "selected" : ""}`}
                onClick={() => toggleSelectPage(page)}
              >
                <CheckCircleFilled className="choose-pages--selected-icon" />
                <div className="choose-pages--icon">{<BrandIcon brandName={page} />}</div>
                {pageInfo.title}
              </div>
            </Card.Grid>
          ))}
        </Card>
      </div>

      <Button type="primary" size="large" block onClick={saveChanges}>
        {i18n("common_save_changes")}
      </Button>
    </div>
  )
}

export default ChoosePages
