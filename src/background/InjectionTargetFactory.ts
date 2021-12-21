import { InjectionTargets, RegexFacebookHomePage, RegexYoutubeHomePage, RegexYoutubeSearchResults, RegexYoutubeVideoView } from "@/common/consts/constants"
import { InjectionTarget } from "@/common/types/types"

export default class InjectionTargetFactory {
  private href: string

  constructor(href: string) {
    this.href = href
  }

  getTargets(): InjectionTarget[] {
    if (RegExp(RegexYoutubeHomePage).test(this.href)) {
      return InjectionTargets.YoutubeHome
    }

    if (RegExp(RegexYoutubeVideoView).test(this.href)) {
      return InjectionTargets.YoutubeVideoView
    }

    if (RegExp(RegexFacebookHomePage).test(this.href)) {
      return InjectionTargets.FacebookHomePage
    }

    return []
  }
}
