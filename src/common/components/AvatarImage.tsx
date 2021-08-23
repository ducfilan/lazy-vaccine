import * as React from "react"

import { Avatar, Image } from "antd"

function AvatarImage(props: { imageUrl?: string; fallbackCharacter?: string }) {
  return props.imageUrl ? (
    <Avatar src={<Image src={props.imageUrl} preview={false} />} />
  ) : (
    <Avatar>{(props.fallbackCharacter || "?")[0]}</Avatar>
  )
}

export default AvatarImage
