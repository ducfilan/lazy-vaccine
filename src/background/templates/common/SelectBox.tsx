import { Form } from "antd"
import * as React from "react"
import AngleDownLightIcon from "@img/ui/fa/angle-down-light.svg"

import "../css/select-box.scss"

export const SelectBox = (props: {
  label: string
  hint: string
  options: { key: string; value: string }[]
  settingKey: string
}) => {
  return (
    <Form.Item label={props.label}>
      <div className="select-menu" data-setting-key={props.settingKey}>
        <div className="select-btn">
          <span className="sBtn-text">{props.hint}</span>
          <i>
            <AngleDownLightIcon />
          </i>
        </div>

        <ul className="options">
          {props.options.map((option) => (
            <li className="option" data-key={option.key} key={option.key}>
              <span className="option-text">
                {option.value}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Form.Item>
  )
}
