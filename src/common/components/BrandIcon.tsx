import * as React from "react"

import { SupportingPages } from "@consts/constants"

import FacebookIcon from "@img/ui/fa/brands/facebook.svg"
import YoutubeIcon from "@img/ui/fa/brands/youtube.svg"
import AmazonIcon from "@img/ui/fa/brands/amazon.svg"
import EbayIcon from "@img/ui/fa/brands/ebay.svg"
import TwitterIcon from "@img/ui/fa/brands/twitter.svg"
import RedditIcon from "@img/ui/fa/brands/reddit.svg"
import GoogleIcon from "@img/ui/fa/brands/google.svg"
import PinterestIcon from "@img/ui/fa/brands/pinterest.svg"
import MessengerIcon from "@img/ui/fa/brands/messenger.svg"

function BrandIcon({ brandName }: { brandName: string }) {
  let icon: JSX.Element | undefined

  switch (brandName) {
    case SupportingPages.facebook.key:
      icon = <FacebookIcon />
      break
    case SupportingPages.youtube.key:
      icon = <YoutubeIcon />
      break
    case SupportingPages.amazon.key:
      icon = <AmazonIcon />
      break
    case SupportingPages.ebay.key:
      icon = <EbayIcon />
      break
    case SupportingPages.twitter.key:
      icon = <TwitterIcon />
      break
    case SupportingPages.reddit.key:
      icon = <RedditIcon />
      break
    case SupportingPages.google.key:
      icon = <GoogleIcon />
      break
    case SupportingPages.pinterest.key:
      icon = <PinterestIcon />
      break
    case SupportingPages.messenger.key:
      icon = <MessengerIcon />
      break

    default:
      break
  }

  return <>{icon ?? ""}</>
}

export default BrandIcon
