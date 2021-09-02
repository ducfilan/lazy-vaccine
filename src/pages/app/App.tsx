import * as React from "react"
import { Layout, Button, Input } from "antd"
import Navbar from "@/common/components/Navbar"
import { RocketOutlined, SearchOutlined } from "@ant-design/icons"

const { useState, useEffect } = React

import "./css/app.scss"
import CreateSetPage from "./create-set/CreateSet"
import PageFooter from "@/common/components/PageFooter"
import Sidebar from "./components/Sider"

const { Content } = Layout

const AppPage = () => {
  return (
    <Layout>
      <Navbar
        centerComponent={
          <Input
            placeholder={chrome.i18n.getMessage("create_set_search_place_holder")}
            className="is-absolute"
            size="large"
            suffix={<SearchOutlined style={{ color: "rgba(0,0,0,.45)" }} />}
          />
        }
        extraComponents={[
          <Button key="create-set" size="large" className="navbar-create-set--wrapper" icon={<RocketOutlined />}>
            {chrome.i18n.getMessage("create_set_button")}
          </Button>,
        ]}
      />
      <Layout className="body-content">
        <Sidebar width={250} />
        <Layout style={{ padding: "0 24px 24px" }}>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
            }}
          >
            <CreateSetPage />
          </Content>
        </Layout>
      </Layout>
      <PageFooter />
    </Layout>
  )
}

export default AppPage
