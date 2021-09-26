import * as React from "react"
import { Typography, Card, Affix, Col, Row, Space, Button } from "antd"
import { EditOutlined } from "@ant-design/icons"
import { Link } from "react-router-dom"
import { formatString, langCodeToName } from "@/common/utils/stringUtils"
import { useGlobalContext } from "@/common/contexts/GlobalContext"
import { useSetDetailContext } from "../contexts/SetDetailContext"

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
        <Row gutter={8}>
          <Col flex="none">{i18n("common_creator")}:</Col>
          <Col flex="auto">
            <Link className="page-header--title" to={`/users/${setInfo?.creatorId}`}>
              {setInfo?.creatorName}
            </Link>
          </Col>
        </Row>
        <Row align="middle">
          <Col span={18}>
            {formatString(i18n("set_detail_sub_header_base_part"), [
              {
                key: "item_count",
                value: `${setInfo?.items?.length}` || "-",
              },
              {
                key: "from_language",
                value: langCodeToName(setInfo?.fromLanguage as string),
              },
            ])}
            {setInfo?.toLanguage &&
              formatString(i18n("set_detail_sub_header_part_2"), [
                {
                  key: "to_language",
                  value: langCodeToName(setInfo?.toLanguage as string),
                },
              ])}
          </Col>
          <Col span={6}>
            <Space className="float-right">
              {user?._id === setInfo?.creatorId && (
                <Button type="primary" className="is-uppercase" icon={<EditOutlined />}>
                  {i18n("set_detail_edit_set")}
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>
    </Affix>
  )
}

export default Header
