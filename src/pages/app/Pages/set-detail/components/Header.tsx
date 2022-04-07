import * as React from "react"
import parse from "html-react-parser"

import { Typography, Card, Affix, Col, Row, Space, Button } from "antd"
import { EditOutlined, ArrowDownOutlined } from "@ant-design/icons"
import { Link } from "react-router-dom"
import { formatString, langCodeToName } from "@/common/utils/stringUtils"
import { useGlobalContext } from "@/common/contexts/GlobalContext"
import { useSetDetailContext } from "../contexts/SetDetailContext"
import { AppPages } from "@/common/consts/constants"

const i18n = chrome.i18n.getMessage

const Header = () => {
  const { user } = useGlobalContext()
  const { setInfo } = useSetDetailContext()

  return (
    <Affix offsetTop={16}>
      <Card className="set-detail--head">
        <Row gutter={8}>
          <Col flex="auto">
            <Typography.Title level={3} className="page-header--title">
              {setInfo?.name}
            </Typography.Title>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Typography.Paragraph
              ellipsis={{ rows: 2, expandable: true, symbol: <ArrowDownOutlined /> }}
              className="page-header--description top-8px"
            >
              {setInfo?.description || i18n("set_detail_no_desc")}
            </Typography.Paragraph>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col flex="none">{i18n("common_creator")}:</Col>
          <Col flex="auto">
            <Link
              className="page-header--title"
              to={`${AppPages.UserProfile.path.replace(":userId", setInfo?.creatorId || "")}`}
            >
              {setInfo?.creatorName}
            </Link>
          </Col>
        </Row>
        <Row align="middle">
          <Col span={18} className="page-header--items-info">
            {formatString(i18n("set_detail_sub_header_base_part"), [
              {
                key: "item_count",
                value: `${setInfo?.items?.length}` || "-",
              },
            ])}
            {parse(
              formatString(i18n("set_detail_sub_header_part_1"), [
                {
                  key: "from_language",
                  value: langCodeToName(setInfo?.fromLanguage as string),
                },
              ])
            )}
            {setInfo?.toLanguage &&
              parse(
                formatString(i18n("set_detail_sub_header_part_2"), [
                  {
                    key: "to_language",
                    value: langCodeToName(setInfo?.toLanguage as string),
                  },
                ])
              )}
          </Col>
          <Col span={6}>
            <Space className="float-right">
              {user?._id === setInfo?.creatorId && (
                <Link to={`${AppPages.EditSet.path.replace(":setId", setInfo?._id || "")}`}>
                  <Button type="primary" className="is-uppercase" icon={<EditOutlined />}>
                    {i18n("set_detail_edit_set")}
                  </Button>
                </Link>
              )}
            </Space>
          </Col>
        </Row>
      </Card>
    </Affix>
  )
}

export default Header
