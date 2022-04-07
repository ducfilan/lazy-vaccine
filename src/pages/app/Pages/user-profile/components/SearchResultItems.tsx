import * as React from "react"

import { SetInfo } from "@/common/types/types"
import { List, Skeleton, Typography } from "antd"
import SetItemCardSmall from "@/pages/app/components/SetItemCardSmall"

const { useEffect } = React

const SearchResultItems = (props: { sets: SetInfo[] }) => {
  return (
    <>
      {props.sets && props.sets.length ? (
        <List
          grid={{ gutter: 16, column: 3 }}
          dataSource={props.sets}
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

export default SearchResultItems
