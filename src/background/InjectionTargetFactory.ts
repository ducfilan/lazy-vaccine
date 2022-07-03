import { InjectionTargets, RegexFacebookHomePage, RegexGoogleHomePage, RegexTwitterHomePage, RegexYoutubeHomePage, RegexYoutubeSearchResults, RegexYoutubeVideoView } from "@/common/consts/constants"
import { InjectionTarget } from "@/common/types/types"

export default class InjectionTargetFactory {
  private href: string

  constructor(href: string) {
    this.href = href
  }

  getTargets(): InjectionTarget[] {
    if (RegExp(RegexYoutubeVideoView).test(this.href)) {
      return InjectionTargets.YoutubeVideoView
    }

    if (RegExp(RegexYoutubeHomePage).test(this.href)) {
      return InjectionTargets.YoutubeHome
    }

    if (RegExp(RegexFacebookHomePage).test(this.href)) {
      return InjectionTargets.FacebookHomePage
    }

    if (RegExp(RegexGoogleHomePage).test(this.href)) {
      return InjectionTargets.GoogleHomePage
    }

    if (RegExp(RegexTwitterHomePage).test(this.href)) {
      return InjectionTargets.TwitterHomePage
    }

    return []
  }
}
