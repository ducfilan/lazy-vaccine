import * as React from "react"
import "./css/image-pin.scss"

const ImagePin = (props: { style?: object; widthPx?: number; heightPx?: number; imgUrl: string; imgStyle: object }) => {
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
        <img src={props.imgUrl} style={props.imgStyle} />
      </div>
    </div>
  )
}

export default ImagePin
