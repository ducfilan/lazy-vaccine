import React, { useEffect, useState } from "react"

import { SearchSetsResponse, SetInfo } from "@/common/types/types"
import { Divider, List, Result, Select, Skeleton, Tag, Typography } from "antd"
import { useGlobalContext } from "@/common/contexts/GlobalContext"
import { searchSets } from "@/common/repo/set"
import SetItemCardLong from "@/pages/app/components/SetItemCardLong"
import InfiniteScroll from "react-infinite-scroll-component"
import shibaEmptyBoxIcon from "@img/emojis/shiba/box.png"
import { formatString } from "@/common/utils/stringUtils"
import { ColorPrimary, i18n } from "@/common/consts/constants"
import SupportingLanguages from "@/common/consts/supportingLanguages"

const SearchResultItems = (props: { keyword: string; languages: string[] }) => {
  const { http } = useGlobalContext()

  const [sets, setSets] = useState<SetInfo[]>([])
  const [skip, setSkip] = useState<number>()
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [totalSetsCount, setTotalSetsCount] = useState<number>(-1)
  const [searchLanguages, setSearchLanguages] = useState<string[]>(props.languages || [])

  const limitItemsPerGet = 5

  const handleLoadData = () => {
    if (!http || isSearching) return
    setIsSearching(true)

    searchSets(http, props.keyword, searchLanguages, skip || 0, limitItemsPerGet)
      .then((resp: SearchSetsResponse) => {
        if (!resp || resp.sets.length === 0) return

        setTotalSetsCount(resp.total)
        setSkip(sets.length + resp.sets.length)
        setSets([...sets, ...resp.sets])
      })
      .catch((error) => console.error(error))
      .finally(() => setIsSearching(false))
  }

  const resetItemsState = () => {
    setSkip(0)
    setIsSearching(false)
    setTotalSetsCount(-1)
    setSets([])
  }

  useEffect(() => {
    resetItemsState()
  }, [http, props.keyword])

  useEffect(() => {
    sets?.length === 0 && handleLoadData()
  }, [sets])

  return totalSetsCount > 0 ? (
    <>
      <div className="search-result--languages-container">
        <p>{i18n("search_result_in_languages")}:</p>
        <Select
          mode="multiple"
          showArrow
          tagRender={({ label, value, closable, onClose }) => {
            const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
              event.preventDefault()
              event.stopPropagation()
            }
            return (
              <Tag
                color={ColorPrimary}
                onMouseDown={onPreventMouseDown}
                closable={closable}
                onClose={onClose}
                style={{ marginRight: 3 }}
              >
                {label}
              </Tag>
            )
          }}
          defaultValue={searchLanguages}
          options={Object.values(SupportingLanguages.Set).map((lang) => ({ label: lang.name, value: lang.code }))}
          onChange={(values) => setSearchLanguages(values)}
          onBlur={resetItemsState}
          onDeselect={resetItemsState}
        />
      </div>
      <InfiniteScroll
        dataLength={sets.length}
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
    </>
  ) : totalSetsCount === 0 ? (
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
  ) : (
    <Skeleton avatar paragraph={{ rows: 3 }} active />
  )
}

export default SearchResultItems
