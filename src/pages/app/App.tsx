import React from "react"
import { Layout, Button, Input, ConfigProvider, Skeleton, notification } from "antd"
import enUS from "antd/lib/locale/en_US"
import viVN from "antd/lib/locale/vi_VN"
import jaJP from "antd/lib/locale/ja_JP"
import zhCN from "antd/lib/locale/zh_CN"

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
import { getGoogleAuthTokenSilent } from "@facades/authFacade"
import { Http } from "@facades/axiosFacade"
import { GlobalContext } from "@/common/contexts/GlobalContext"
import { Routes, Route, useNavigate, useLocation, useSearchParams } from "react-router-dom"
import { Locale } from "antd/lib/locale-provider"
import SearchResultPage from "./Pages/search-result/SearchResult"
import UserProfilePage from "./Pages/user-profile/UserProfile"
import CategorySetsPage from "./Pages/category-sets/CategorySets"
import SeedDetailPage from "./Pages/seed-detail/SeedDetail"
import TestSetPage from "./Pages/test-set/TestSet"
import MarketPlacePage from "./Pages/marketplace/MarketPlacePage"
import { BeforeLoginPage } from "./Pages/before-login/BeforeLoginPage"
import { GettingStartedPage } from "./Pages/getting-started/GettingStartedPage"
import SupportingLanguages from "@/common/consts/supportingLanguages"
import NetworkError from "@/common/components/NetworkError"

const { Content } = Layout

const langCodeToAntLocaleMap = {
  [SupportingLanguages.Set.en.code]: enUS,
  [SupportingLanguages.Set.vi.code]: viVN,
  [SupportingLanguages.Set.ja.code]: jaJP,
  [SupportingLanguages.Set.zh.code]: zhCN,
}

const defaultLocale = enUS

export function getErrorView(lastError: any, setLastError: any, defaultView: any) {
  setLastError(null)

  switch (lastError?.code) {
    case "ECONNABORTED":
      if (lastError.message.startsWith("timeout of")) {
        return (
          <div>
            <NetworkError errorText={i18n("network_error_timeout")} />
          </div>
        )
      }
      break

    case "ERR_NETWORK":
      return (
        <div>
          <NetworkError errorText={i18n("network_error_offline")} />
        </div>
      )

    default:
      break
  }

  return defaultView
}

const AppPage = () => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [http, setHttp] = useState<Http | null>(null)
  const [locale, setLocale] = useState<Locale>(enUS)
  const [lastError, setLastError] = useState<any>(null)

  const [searchParams] = useSearchParams()
  const source = searchParams.get("source")

  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    setIsLoading(true)

    getGoogleAuthTokenSilent()
      .then((token: string) => {
        const newHttp = new Http(token, LoginTypes.google)
        setHttp(newHttp)

        getMyInfo(newHttp)
          .then((userInfo) => {
            setUser(userInfo)
            setLocale(langCodeToAntLocaleMap[userInfo.locale] || defaultLocale)
          })
          .catch((error) => {
            notification["error"]({
              message: i18n("error"),
              description: i18n("unexpected_error_message"),
              duration: null,
            })

            console.error(error)
            setLastError(error)
          })
          .finally(() => {
            setIsLoading(false)
          })
      })
      .catch((error: any) => {
        console.error(error)
        setLastError(error)
        setIsLoading(false)
      })
  }, [])

  return (
    <GlobalContext.Provider value={{ user, setUser, http, setHttp }}>
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
                  navigate(`${AppPages.Sets.path}?keyword=${(target as HTMLInputElement).value}`)
                }}
              />
            }
            extraComponents={[
              <Button
                key="create-set"
                size="large"
                className="navbar-create-set--wrapper"
                icon={<RocketOutlined />}
                onClick={() => location.pathname !== AppPages.CreateSet.path && navigate(AppPages.CreateSet.path)}
              >
                {i18n("create_set_button")}
              </Button>,
            ]}
          />
          <Layout className="body-content">
            <PagesNavigator path={location.pathname} />
            <Layout style={{ padding: 24 }}>
              <Content>
                {(!http || !user) && source !== "popup" ? (
                  isLoading ? (
                    <Skeleton active />
                  ) : (
                    getErrorView(lastError, setLastError, <BeforeLoginPage />)
                  )
                ) : (
                  <Routes>
                    <Route path={AppPages.Home.path} element={<HomePage />} />
                    <Route path={AppPages.CreateSet.path} element={<CreateSetPage />} />
                    <Route path={AppPages.EditSet.path} element={<CreateSetPage />} />
                    <Route path={AppPages.Sets.path} element={<SearchResultPage />} />
                    <Route path={AppPages.SetDetail.path} element={<SetDetailPage />} />
                    <Route path={AppPages.UserProfile.path} element={<UserProfilePage />} />
                    <Route path={AppPages.MySpace.path} element={<UserProfilePage />} />
                    <Route path={AppPages.CategorySets.path} element={<CategorySetsPage />} />
                    <Route path={AppPages.MarketPlace.path} element={<MarketPlacePage />} />
                    <Route path={AppPages.SeedDetail.path} element={<SeedDetailPage />} />
                    <Route path={AppPages.TestSet.path} element={<TestSetPage />} />
                    <Route path={AppPages.GettingStarted.path} element={<GettingStartedPage />} />
                  </Routes>
                )}
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
