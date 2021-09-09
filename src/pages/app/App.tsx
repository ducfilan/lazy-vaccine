import * as React from "react"
import { Layout, Button, Input } from "antd"
import Navbar from "@/common/components/Navbar"
import { RocketOutlined, SearchOutlined } from "@ant-design/icons"

const { useState, useEffect } = React

import "./css/app.scss"
import CreateSetPage from "./components/CreateSet"
import HomePage from "./components/Home"
import PageFooter from "@/common/components/PageFooter"
import Sidebar from "./components/Sider"

import { User } from "@/common/types/types"
import { getUserInfo } from "@/common/api/user"
import { AppPages, LoginTypes } from "@/common/consts/constants"
import { getGoogleAuthToken } from "@facades/authFacade"
import { Http } from "@facades/axiosFacade"
import { GlobalContext } from "@/common/contexts/GlobalContext"
import { Route, Switch, useHistory, useLocation } from "react-router-dom"
import SetsPage from "./components/Sets"

const { Content } = Layout

const AppPage = () => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [http, setHttp] = useState<Http>()
  const history = useHistory()
  const location = useLocation()

  useEffect(() => {
    try {
      setIsLoading(true)

      getGoogleAuthToken((token: string) => {
        setHttp(new Http(token, LoginTypes.google))
      }, {})
    } catch (error) {
      // Not able to login with current token, ignore to show the first page to login.
    }
  }, [])

  useEffect(() => {
    if (!http) return

    getUserInfo(http)
      .then((userInfo) => {
        setUser(userInfo)
        setIsLoading(false)
      })
      .catch((error) => {
        setIsLoading(false)
        // Not able to login with current token, ignore to show the first page to login.
      })
  }, [http])

  return (
    <GlobalContext.Provider value={{ user, setUser, http }}>
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
            <Button
              key="create-set"
              size="large"
              className="navbar-create-set--wrapper"
              icon={<RocketOutlined />}
              onClick={() =>
                history.location.pathname !== AppPages.CreateSet.path && history.push(AppPages.CreateSet.path)
              }
            >
              {chrome.i18n.getMessage("create_set_button")}
            </Button>,
          ]}
        />
        <Layout className="body-content">
          <Sidebar width={150} path={location.pathname} />
          <Layout style={{ padding: 24 }}>
            <Content>
              <Switch>
                <Route exact path={AppPages.Home.path} component={HomePage} />
                <Route path={AppPages.CreateSet.path} component={CreateSetPage} />
                <Route path={AppPages.Sets.path} component={SetsPage} />
              </Switch>
            </Content>
          </Layout>
        </Layout>
        <PageFooter />
      </Layout>
    </GlobalContext.Provider>
  )
}

export default AppPage
