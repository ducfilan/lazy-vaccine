import { Col, Row } from "antd"
import React from "react"
import "../css/text-card.scss"

const TextCard = (props: React.PropsWithChildren<{ imgUrl: string }>) => {
  return (
    <div className="text-card--wrapper">
      <Row justify="space-around" align="middle">
        <Col span={12}>
          <img src={props.imgUrl} />
        </Col>
        <Col span={12} className="text-card--text">
          {props.children}
        </Col>
      </Row>
    </div>
  )
}

export default TextCard
