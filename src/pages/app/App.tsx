import * as React from "react"
import { Layout, Button } from "antd"
import Navbar from "@/common/components/Navbar"
import { RocketOutlined } from "@ant-design/icons"

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
