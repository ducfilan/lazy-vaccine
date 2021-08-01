import * as React from "react"

import { usePopupContext } from "../contexts/PopupContext"

import LanguageItem from "./LanguageItem"

import LeftIcon from "../../../images/ui/fa/angle-left-solid.svg"
import RightIcon from "../../../images/ui/fa/angle-right-solid.svg"
import PlusIcon from "../../../images/ui/fa/plus-solid.svg"
import Language from "../types/Language"
import supportingLanguages from "../../../common/consts/supportingLanguages"

function SelectLanguages() {
  const { selectedLanguages } = usePopupContext()

  return (
    <div className="choose-languages--wrapper">
      <div className="choose-languages--header-info has-text-centered">
        <div className="choose-languages--title-wrapper">
          <h3 className="title">Choose your using languages by order of your ability</h3>
        </div>
      </div>
      <div className="choose-languages--pages-list columns is-centered is-multiline is-relative">
        <div className="next-prev-buttons--wrapper">
          <button className="button is-primary next-prev-buttons--prev-button">
            <LeftIcon />
          </button>
          <button className="button is-primary next-prev-buttons--next-button">
            <RightIcon />
          </button>
        </div>
        <div className="column is-6">
          <div className="choose-languages--selected-languages-wrapper">
            {selectedLanguages.map((language: Language) => (
              <LanguageItem language={language} />
            ))}
          </div>
          <div className="dropdown choose-languages--selection-wrapper">
            <button className="dropdown-button choose-languages--dropdown-button">
              <div className="choose-languages--flag"></div>
              <span className="choose-language--dropdown-label" data-langCode="">
                Select a language
              </span>
              <div className="choose-language--dropdown-icon">
                <RightIcon />
              </div>
            </button>
            <button className="button is-primary choose-language--add-icon">
              <PlusIcon />
            </button>
            <ul className="dropdown-menu choose-languages--dropdown-menu">
              <div className="languages-table">
                <div className="languages-table-row">
                  {supportingLanguages.Set.map((language: Language) => (
                    <div className="choose-languages--language-cell">
                      <a href="#">
                        <div className="choose-languages--flag">
                          <i></i>
                        </div>
                        <span className="languages-table-label"></span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SelectLanguages
