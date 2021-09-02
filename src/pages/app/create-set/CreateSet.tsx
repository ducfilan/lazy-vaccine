import * as React from "react"

import { Col, Row } from "antd"

const CreateSetPage = () => {
  return (
    <div className="create-set--wrapper">
      <Row gutter={[16, 16]}>
        <Col xs={{ span: 24 }} lg={{ span: 16 }}>
          Col
        </Col>
        <Col xs={{ span: 24 }} lg={{ span: 8 }}>
          Col
        </Col>
      </Row>
    </div>
  )
}

export default CreateSetPage
