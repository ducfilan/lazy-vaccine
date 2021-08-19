import * as React from "react"

import { MinusCircleFilled } from "@ant-design/icons"
import Flag from "@/common/components/Flag"

function LanguageItem({
  isRemovable,
  code,
  name,
  onRemove,
}: {
  isRemovable: boolean
  code: string
  name: string
  onRemove: Function
}) {
  return (
    <div className="choose-languages--page-item has-text-white is-relative">
      {isRemovable && (
        <button
          className="button choose-languages--remove-button"
          onClick={() => {
            onRemove(code)
          }}
        >
          <MinusCircleFilled />
        </button>
      )}
      <span className="choose-language--language-label">{name}</span>
      <div className="choose-languages--flag">
        <Flag langCode={code} />
      </div>
    </div>
  )
}

export default LanguageItem
