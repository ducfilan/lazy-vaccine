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

function BrandIcon({ brandName }: { brandName: string }) {
  let BrandIcon: JSX.Element | undefined

  switch (brandName) {
    case SupportingPages.facebook.key:
      BrandIcon = <FacebookIcon />
      break
    case SupportingPages.youtube.key:
      BrandIcon = <YoutubeIcon />
      break
    case SupportingPages.amazon.key:
      BrandIcon = <AmazonIcon />
      break
    case SupportingPages.ebay.key:
      BrandIcon = <EbayIcon />
      break
    case SupportingPages.twitter.key:
      BrandIcon = <TwitterIcon />
      break
    case SupportingPages.reddit.key:
      BrandIcon = <RedditIcon />
      break
    case SupportingPages.google.key:
      BrandIcon = <GoogleIcon />
      break
    case SupportingPages.pinterest.key:
      BrandIcon = <PinterestIcon />
      break

    default:
      break
  }

  return <>{BrandIcon ?? ""}</>
}

export default BrandIcon
