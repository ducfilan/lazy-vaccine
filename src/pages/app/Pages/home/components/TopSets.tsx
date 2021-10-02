import * as React from "react"
import { Typography, Card } from "antd"

const TopSets = (props: { innerContent: string | React.ReactElement }) => {
  return (
    <Card style={{ marginBottom: 16 }}>
      {typeof props.innerContent === "string" ? (
        <Typography.Title level={3} className="page-header--title">
          {props.innerContent}
        </Typography.Title>
      ) : (
        props.innerContent
      )}
    </Card>
  )
}

export default TopSets
