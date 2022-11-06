import React from "react"
import "./css/image-pin.scss"

const ImagePin = (props: {
  style?: object
  widthPx?: number
  heightPx?: number
  img: string | JSX.Element
  imgStyle?: object
}) => {
  return (
    <div style={props.style}>
      <div className="image-pin--wrapper">
        <p
          className="lzv-pin-img"
          style={{
            width: props.widthPx || 100,
            height: props.heightPx || 100,
          }}
        />
        {typeof props.img === "string" ? <img src={props.img} style={props.imgStyle} /> : props.img}
      </div>
    </div>
  )
}

export default ImagePin
