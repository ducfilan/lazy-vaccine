import * as React from "react"

import ArFlag from "../../images/ui/flags/ar.svg"
import ZhFlag from "../../images/ui/flags/zh.svg"
import NlFlag from "../../images/ui/flags/nl.svg"
import EnFlag from "../../images/ui/flags/en.svg"
import DeFlag from "../../images/ui/flags/de.svg"
import ItFlag from "../../images/ui/flags/it.svg"
import JaFlag from "../../images/ui/flags/ja.svg"
import KoFlag from "../../images/ui/flags/ko.svg"
import MnFlag from "../../images/ui/flags/mn.svg"
import PtFlag from "../../images/ui/flags/pt.svg"
import RuFlag from "../../images/ui/flags/ru.svg"
import SlFlag from "../../images/ui/flags/sl.svg"
import EsFlag from "../../images/ui/flags/es.svg"
import ViFlag from "../../images/ui/flags/vi.svg"

function Flag({ langCode }: { langCode: string }) {
  let flag: JSX.Element | undefined

  switch (langCode) {
    case "ar":
      flag = <ArFlag />
      break
    case "zh":
      flag = <ZhFlag />
      break
    case "nl":
      flag = <NlFlag />
      break
    case "en":
      flag = <EnFlag />
      break
    case "de":
      flag = <DeFlag />
      break
    case "it":
      flag = <ItFlag />
      break
    case "ja":
      flag = <JaFlag />
      break
    case "ko":
      flag = <KoFlag />
      break
    case "mn":
      flag = <MnFlag />
      break
    case "pt":
      flag = <PtFlag />
      break
    case "ru":
      flag = <RuFlag />
      break
    case "sl":
      flag = <SlFlag />
      break
    case "es":
      flag = <EsFlag />
      break
    case "vi":
      flag = <ViFlag />

    default:
      break
  }

  return <>{flag}</>
}

export default Flag
