import * as React from "react"

import { Avatar, Image } from "antd"
import { Link } from "react-router-dom"

function AvatarImage(props: { size?: number; imageUrl?: string; fallbackCharacter?: string; link?: string }) {
  const image = props.imageUrl ? (
    <Avatar size={props.size || 32} src={<Image src={props.imageUrl} preview={false} />} />
  ) : (
    <Avatar>{(props.fallbackCharacter || "?")[0]}</Avatar>
  )

  return props.link ? <Link to={props.link}>{image}</Link> : image
}

export default AvatarImage
