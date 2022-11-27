import { InjectionTargetsResponse } from "@/common/types/types";

export const getHref = () => document.location.href

export const isElementAtBottom = (target: HTMLElement, threshold: number = 0.8) => {
    if (target.nodeName === "#document") target = document.documentElement;

    const clientHeight =
        target === document.body || target === document.documentElement
            ? window.screen.availHeight
            : target.clientHeight;

    return target.scrollTop + clientHeight >= threshold * target.scrollHeight;
};

export const isSiteSupportedInjection = (targets: InjectionTargetsResponse, href: string): boolean => {
    if (!targets) return false

    for (const target of targets) {
        if (RegExp(target.MatchPattern).test(href)) {
            return true
        }
    }

    return false
}
