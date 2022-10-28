import { getInjectionTargets } from "@/common/repo/staticApis"
import { InjectionTarget } from "@/common/types/types"

export default class InjectionTargetFactory {
  private href: string

  constructor(href: string) {
    this.href = href
  }

  async getTargets(): Promise<InjectionTarget[]> {
    const targets = await getInjectionTargets()

    for (const target of targets) {
      if (RegExp(target.MatchPattern).test(this.href)) {
        return target.Targets
      }
    }

    return []
  }
}
