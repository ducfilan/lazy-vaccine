import React from "react"

import { SetInfo } from "@/common/types/types"
import { Divider, List, Skeleton } from "antd"
import { useEffect, useState } from "react"
import { useGlobalContext } from "@/common/contexts/GlobalContext"
import { searchSets } from "@/common/repo/set"
import SetItemCardLong from "@/pages/app/components/SetItemCardLong"
import InfiniteScroll from "react-infinite-scroll-component"

const i18n = chrome.i18n.getMessage

const SearchResultItems = (props: { keyword: string }) => {
  const { http } = useGlobalContext()

  const [sets, setSets] = useState<SetInfo[]>([])
  const [skip, setSkip] = useState<number>()
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [totalSetsCount, setTotalSetsCount] = useState<number>()

  const limitItemsPerGet = 5

  const handleLoadData = () => {
    if (!http || isSearching) return
    setIsSearching(true)

    searchSets(http, props.keyword, skip || 0, limitItemsPerGet)
      .then((newSets: SetInfo[]) => {
        if (!newSets || newSets.length === 0) return

        setTotalSetsCount(newSets[0].total)
        setSkip(sets.length + newSets.length)
        setSets([...sets, ...newSets])
        setIsSearching(false)
      })
      .catch((error) => console.error(error))
  }

  const resetItemsState = () => {
    setSkip(0)
    setIsSearching(false)
    setTotalSetsCount(0)
    setSets([])
  }

  useEffect(() => {
    resetItemsState()
  }, [http, props.keyword])

  useEffect(() => {
    sets?.length === 0 && handleLoadData()
  }, [sets])

  return totalSetsCount ? (
    <InfiniteScroll
      dataLength={totalSetsCount}
      next={handleLoadData}
      hasMore={sets.length < totalSetsCount}
      loader={<Skeleton avatar paragraph={{ rows: 3 }} active />}
      endMessage={<Divider plain>{i18n("common_end_list_result")}</Divider>}
      scrollableTarget="document"
    >
      <List
        dataSource={sets}
        renderItem={(set) => (
          <List.Item key={set._id}>
            <SetItemCardLong set={set} />
          </List.Item>
        )}
      />
    </InfiniteScroll>
  ) : (
    <Skeleton avatar paragraph={{ rows: 3 }} active />
  )
}

export default SearchResultItems
