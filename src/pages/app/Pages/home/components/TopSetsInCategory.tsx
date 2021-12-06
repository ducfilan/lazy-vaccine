import * as React from "react"

import { useGlobalContext } from "@/common/contexts/GlobalContext"
import { useState } from "react"
import { SetInfo } from "@/common/types/types"
import useLocalStorage from "@/common/hooks/useLocalStorage"
import CacheKeys from "@/common/consts/cacheKeys"
import { getTopSetsInCategory } from "@/common/api/set"
import SetItemCardSmall from "./SetItemCardSmall"
import { List, Skeleton, Typography } from "antd"

const { useEffect } = React

const TopSetsInCategory = (props: { categoryId: string; title: string }) => {
  const { user, http } = useGlobalContext()
  const [cachedTopSetsInCategory, setCachedTopSetsInCategory] = useLocalStorage<SetInfo[]>(
    `${CacheKeys.topSets}_categoryId_${props.categoryId}`,
    [],
    "1d"
  )
  const [topSets, setTopSetsInCategory] = useState<SetInfo[]>([])

  useEffect(() => {
    if (!http || !user) return

    if (cachedTopSetsInCategory) {
      setTopSetsInCategory(cachedTopSetsInCategory)
    } else {
      getTopSetsInCategory(http, user.locale, props.categoryId).then((sets: SetInfo[]) => {
        setTopSetsInCategory(sets)
        setCachedTopSetsInCategory(sets)
      })
    }
  }, [http, user])

  return (
    <>
      <Typography.Title level={3}>{props.title}</Typography.Title>
      {topSets && topSets.length ? (
        <List
          grid={{ gutter: 16, column: 3 }}
          dataSource={topSets}
          renderItem={(set) => (
            <List.Item>
              <SetItemCardSmall set={set} key={set._id} />
            </List.Item>
          )}
        />
      ) : (
        <Skeleton active />
      )}
    </>
  )
}

export default TopSetsInCategory
