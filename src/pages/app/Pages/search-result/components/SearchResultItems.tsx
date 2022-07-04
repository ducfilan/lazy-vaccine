import React from "react"

import { SearchSetsResponse, SetInfo } from "@/common/types/types"
import { Divider, List, Result, Skeleton, Typography } from "antd"
import { useEffect, useState } from "react"
import { useGlobalContext } from "@/common/contexts/GlobalContext"
import { searchSets } from "@/common/repo/set"
import SetItemCardLong from "@/pages/app/components/SetItemCardLong"
import InfiniteScroll from "react-infinite-scroll-component"
import shibaEmptyBoxIcon from "@img/emojis/shiba/box.png"
import { formatString } from "@/common/utils/stringUtils"
import { i18n } from "@/common/consts/constants"

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
      .then((resp: SearchSetsResponse) => {
        setIsSearching(false)

        if (!resp || resp.sets.length === 0) return

        setTotalSetsCount(resp.total)
        setSkip(sets.length + resp.sets.length)
        setSets([...sets, ...resp.sets])
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
  ) : isSearching ? (
    <Skeleton avatar paragraph={{ rows: 3 }} active />
  ) : (
    <Result icon={<img src={shibaEmptyBoxIcon} />} title={i18n("common_not_found")}>
      <Typography.Paragraph>
        {formatString(i18n("search_result_not_found"), [
          {
            key: "keyword",
            value: props.keyword,
          },
        ])}
      </Typography.Paragraph>
    </Result>
  )
}

export default SearchResultItems
