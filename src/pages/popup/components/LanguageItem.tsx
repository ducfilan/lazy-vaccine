import * as React from "react"

import PlusIcon from "../../../images/ui/fa/plus-solid.svg"
import GripLines from "../../../images/ui/fa/grip-lines-solid.svg"
import Language from "../types/Language"
import Flag from "../../../common/components/Flag"

function LanguageItem({ language }: { language: Language }) {
  return (
    <div className="choose-languages--page-item has-text-white is-relative">
      <button className="button is-danger choose-languages--remove-button">
        <PlusIcon />
      </button>
      <div className="choose-languages--drag-icon">
        <GripLines />
      </div>
      <span className="choose-language--language-label">{language.name}</span>
      <div className="choose-languages--flag">
        <Flag langCode={language.code} />
      </div>
    </div>
  )
}

export default LanguageItem
