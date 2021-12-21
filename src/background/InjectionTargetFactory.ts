import { InjectionTargets } from "@/common/consts/constants"
import { InjectionTarget } from "@/common/types/types"

export default class InjectionTargetFactory {
  private href: string
  private regex = {
    YoutubeHomePage: /^https:\/\/(www\.)*youtube\.com\/{0,1}$/,
    YoutubeVideoView: /^https:\/\/(www\.)*youtube\.com\/watch\?v=.*$/,
    YoutubeSearchResults: /^https:\/\/(www\.)*youtube\.com\/results\?search_query=(.*)$/,
    FacebookHomePage: /^https:\/\/(www\.)*facebook\.com\/{0,1}$/,
  }

  constructor(href: string) {
    this.href = href
  }

  getTargets(): InjectionTarget[] {
    if (RegExp(this.regex.YoutubeHomePage).test(this.href)) {
      return InjectionTargets.YoutubeHome
    }

    if (RegExp(this.regex.YoutubeVideoView).test(this.href)) {
      return InjectionTargets.YoutubeVideoView
    }

    if (RegExp(this.regex.FacebookHomePage).test(this.href)) {
      return InjectionTargets.FacebookHomePage
    }

    return []
  }
}
