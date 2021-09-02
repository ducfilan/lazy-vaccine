import * as React from "react"
import { Layout } from "antd"
import Navbar from "@/common/components/Navbar"

const { useState, useEffect } = React

import "./css/app.scss"
import CreateSetPage from "./create-set/CreateSet"
import PageFooter from "@/common/components/PageFooter"
import Sidebar from "./components/Sider"

const { Content } = Layout

const AppPage = () => {
  return (
    <Layout>
      <Navbar />
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
