import { Card } from "antd"
import * as React from "react"

export const QnATemplate = (props: { item: { type: string; [key: string]: any } }) => {
  return (
    <Card
      hoverable
      style={{ width: 240 }}
      cover={<img alt="example" src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png" />}
    >
      <Card.Meta title="Europe Street beat" description="www.instagram.com" />
    </Card>
  )
}
