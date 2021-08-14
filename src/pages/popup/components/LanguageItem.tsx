import * as React from "react"

import { MinusCircleFilled } from "@ant-design/icons"
import Flag from "@/common/components/Flag"

function LanguageItem({ code, name }: { code: string; name: string }) {
  return (
    <div className="choose-languages--page-item has-text-white is-relative">
      <button className="button is-danger choose-languages--remove-button">
        <MinusCircleFilled />
      </button>
      <span className="choose-language--language-label">{name}</span>
      <div className="choose-languages--flag">
        <Flag langCode={code} />
      </div>
    </div>
  )
}

export default LanguageItem
