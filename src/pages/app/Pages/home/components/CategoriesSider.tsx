import * as React from "react"
import { Divider, Input, Layout, Tree, Typography } from "antd"

import { useGlobalContext } from "@/common/contexts/GlobalContext"
import useLocalStorage from "@/common/hooks/useLocalStorage"
import { Category } from "@/common/types/types"
import CacheKeys from "@/common/consts/cacheKeys"
import { getCategories } from "@/common/api/category"
import { useHomeContext } from "../contexts/HomeContext"

const { Title } = Typography
const { Sider } = Layout
const i18n = chrome.i18n.getMessage

const { useState, useEffect, useMemo } = React

const flattenCategories = (categories: any[], depth: number): any[] => {
  return depth > 0
    ? categories.reduce(
        (acc, val) =>
          val.children
            ? acc.concat({ key: val.key, title: val.title }, flattenCategories(val.children, depth - 1))
            : acc.concat({ key: val.key, title: val.title }),
        []
      )
    : categories.slice()
}

const getParentKey = (key: string, tree: any): string => {
  let parentKey
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i]
    if (node.children) {
      if (node.children.some((item: any) => item.key === key)) {
        parentKey = node.key
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children)
      }
    }
  }

  return parentKey
}

const CategoriesSider = (props: { width: number; path: string }) => {
  const { user, http } = useGlobalContext()
  const [cachedCategories, setCachedCategories] = useLocalStorage<Category[]>(CacheKeys.categories, [], "1d")

  const { categories, setCategories } = useHomeContext()

  const categoriesKeys: any[] = useMemo(() => flattenCategories(categories || [], Infinity), [categories])
  const [expandedKeys, setExpandedKeys] = useState<any[]>()

  function lookupCategories(e: any) {
    const { value } = e.target

    const keysToExpand = categoriesKeys
      .map((item) => {
        if (item.title.toLowerCase().indexOf(value.toLowerCase()) > -1) {
          return getParentKey(item.key, categories)
        }
        return null
      })
      .filter((item, i, self) => item && self.indexOf(item) === i)

    setExpandedKeys(keysToExpand)
  }

  useEffect(() => {
    if (!http || !user) return

    if (cachedCategories) {
      setCategories(cachedCategories)
    } else {
      getCategories(http, user.locale).then((categories: Category[]) => {
        setCategories(categories)
        setCachedCategories(categories)
      })
    }
  }, [http, user])

  return (
    <Sider width={props.width} className="categories-sider--wrapper pad-16px">
      <Title level={4}>{i18n("common_category")}</Title>
      <Divider />
      <Input placeholder={i18n("home_category_lookup")} onChange={lookupCategories} className="bot-16px" />
      {/* The states in Ant design which are prefixed with default only work when they are rendered for the first time */}
      {categories && categories.length > 0 && (
        <Tree treeData={categories} expandedKeys={expandedKeys} onExpand={setExpandedKeys} />
      )}
    </Sider>
  )
}

export default CategoriesSider
