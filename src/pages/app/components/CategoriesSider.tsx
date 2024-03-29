import * as React from "react"
import { Divider, Input, Layout, Tree, Typography } from "antd"
import { useGlobalContext } from "@/common/contexts/GlobalContext"
import { Key } from "antd/lib/table/interface"
import { useNavigate } from "react-router-dom"
import { useCategorySetsContext } from "../Pages/category-sets/contexts/CategorySetsContext"
import { i18n } from "@/common/consts/constants"

const { Title } = Typography
const { Sider } = Layout

const { useState, useMemo } = React

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
  for (const node of tree) {
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

const CategoriesSider = (props: any) => {
  const { http } = useGlobalContext()
  const navigate = useNavigate()
  const categoriesKeys: any[] = useMemo(() => flattenCategories(props.categories || [], Infinity), [props.categories])
  const [expandedKeys, setExpandedKeys] = useState<any[]>()
  const { onChangeCategoryId, selectedCategoryId } = useCategorySetsContext()

  function lookupCategories(e: any) {
    const { value } = e.target

    const keysToExpand = categoriesKeys
      .map((item) => {
        if (item.title.toLowerCase().indexOf(value.toLowerCase()) > -1) {
          return getParentKey(item.key, props.categories)
        }
        return null
      })
      .filter((item, i, self) => item && self.indexOf(item) === i)

    setExpandedKeys(keysToExpand)
  }

  const onSelect = (
    _selectedKeys: Key[],
    info: {
      node: any
    }
  ) => {
    const categoryId = `${info.node?.key}`
    const isCategoryPreSelected = categoryId === selectedCategoryId
    if (!http || isCategoryPreSelected) return
    // TODO: Dirty processing, need to change.
    if (location.hash.includes("category")) {
      onChangeCategoryId(categoryId)
      return
    }
    navigate(`/category/${categoryId}`)
  }

  return (
    <Sider width={props.width} className="categories-sider--wrapper pad-16px">
      <Title level={4}>{i18n("common_category")}</Title>
      <Divider />
      <Input placeholder={i18n("home_category_lookup")} onChange={lookupCategories} className="bot-16px" />
      {/* The states in Ant design which are prefixed with default only work when they are rendered for the first time */}
      {props.categories && props.categories.length > 0 && (
        <Tree treeData={props.categories} expandedKeys={expandedKeys} onExpand={setExpandedKeys} onSelect={onSelect} />
      )}
    </Sider>
  )
}

export default CategoriesSider
