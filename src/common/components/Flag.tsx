import * as React from "react"

import ArFlag from "@img/ui/flags/ar.svg"
import ZhFlag from "@img/ui/flags/zh.svg"
import NlFlag from "@img/ui/flags/nl.svg"
import EnFlag from "@img/ui/flags/en.svg"
import DeFlag from "@img/ui/flags/de.svg"
import ItFlag from "@img/ui/flags/it.svg"
import JaFlag from "@img/ui/flags/ja.svg"
import KoFlag from "@img/ui/flags/ko.svg"
import MnFlag from "@img/ui/flags/mn.svg"
import PtFlag from "@img/ui/flags/pt.svg"
import RuFlag from "@img/ui/flags/ru.svg"
import SlFlag from "@img/ui/flags/sl.svg"
import EsFlag from "@img/ui/flags/es.svg"
import ViFlag from "@img/ui/flags/vi.svg"

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

  return <>{flag ?? ""}</>
}

export default Flag
