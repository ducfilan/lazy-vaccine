import * as React from "react"

import { Avatar, Image } from "antd"

function AvatarImage(props: { size?: number; imageUrl?: string; fallbackCharacter?: string }) {
  return props.imageUrl ? (
    <Avatar size={props.size || 32} src={<Image src={props.imageUrl} preview={false} />} />
  ) : (
    <Avatar>{(props.fallbackCharacter || "?")[0]}</Avatar>
  )
}

export default AvatarImage
