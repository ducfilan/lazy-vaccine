import * as React from "react"
import { Layout, Button, Input, ConfigProvider, notification } from "antd"
import enUS from "antd/lib/locale/en_US"

import Navbar from "@/common/components/Navbar"
import { RocketOutlined, SearchOutlined } from "@ant-design/icons"

const { useState, useEffect } = React

import "./css/app.scss"
import CreateSetPage from "./Pages/create-set/CreateSet"
import SetDetailPage from "./Pages/set-detail/SetDetail"
import HomePage from "./Pages/home/Home"
import PageFooter from "@/common/components/PageFooter"
import PagesNavigator from "./components/PagesNavigator"

import { User } from "@/common/types/types"
import { getMyInfo } from "@/common/repo/user"
import { AppPages, i18n, LoginTypes } from "@/common/consts/constants"
import { getGoogleAuthToken } from "@facades/authFacade"
import { Http } from "@facades/axiosFacade"
import { GlobalContext } from "@/common/contexts/GlobalContext"
import { Route, Switch, useHistory, useLocation } from "react-router-dom"
import { Locale } from "antd/lib/locale-provider"
import SearchResultPage from "./Pages/search-result/SearchResult"
import UserProfilePage from "./Pages/user-profile/UserProfile"
import CategorySetsPage from "./Pages/category-sets/CategorySets"
import SeedDetailPage from "./Pages/seed-detail/SeedDetail"
import TestSetPage from "./Pages/test-set/TestSet"
import MarketPlacePage from "./Pages/marketplace/MarketPlacePage"

const { Content } = Layout

const AppPage = () => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [http, setHttp] = useState<Http>()
  const [locale, setLocale] = useState<Locale>(enUS)

  const history = useHistory()
  const location = useLocation()

  useEffect(() => {
    try {
      setIsLoading(true)

      getGoogleAuthToken().then((token: string) => {
        setHttp(new Http(token, LoginTypes.google))
      })
    } catch (error) {
      // Not able to login with current token, ignore to show the first page to login.
      // TODO: Unauthorized resolution.
    }
  }, [])

  useEffect(() => {
    if (!http) return

    getMyInfo(http)
      .then((userInfo) => {
        setUser(userInfo)
        setIsLoading(false)
      })
      .catch((error) => {
        setIsLoading(false)
        notification["error"]({
          message: i18n("error"),
          description: i18n("unexpected_error_message"),
          duration: null,
        })
      })
  }, [http])

  return (
    <GlobalContext.Provider value={{ user, setUser, http }}>
      <ConfigProvider locale={locale}>
        <Layout>
          <Navbar
            centerComponent={
              <Input
                placeholder={i18n("create_set_search_place_holder")}
                className="is-absolute"
                size="large"
                suffix={<SearchOutlined style={{ color: "rgba(0,0,0,.45)" }} />}
                onPressEnter={({ target }) => {
                  history.push(`${AppPages.Sets.path}?keyword=${(target as HTMLInputElement).value}`)
                }}
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
                {i18n("create_set_button")}
              </Button>,
            ]}
          />
          <Layout className="body-content">
            <PagesNavigator path={location.pathname} />
            <Layout style={{ padding: 24 }}>
              <Content>
                <Switch>
                  <Route path={AppPages.Home.path} component={HomePage} />
                  <Route path={AppPages.CreateSet.path} component={CreateSetPage} />
                  <Route path={AppPages.EditSet.path} component={CreateSetPage} />
                  <Route path={AppPages.Sets.path} component={SearchResultPage} />
                  <Route path={AppPages.SetDetail.path} component={SetDetailPage} />
                  <Route path={AppPages.UserProfile.path} component={UserProfilePage} />
                  <Route path={AppPages.MySpace.path} component={UserProfilePage} />
                  <Route path={AppPages.CategorySets.path} component={CategorySetsPage} />
                  <Route path={AppPages.MarketPlace.path} component={MarketPlacePage} />
                  <Route path={AppPages.SeedDetail.path} component={SeedDetailPage} />
                  <Route path={AppPages.TestSet.path} component={TestSetPage} />
                </Switch>
              </Content>
            </Layout>
          </Layout>
          <PageFooter />
        </Layout>
      </ConfigProvider>
    </GlobalContext.Provider>
  )
}

export default AppPage
