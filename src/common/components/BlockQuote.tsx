import * as React from "react"

function BlockQuote(props: { quote: string; author: string }) {
  const styles: { [key: string]: React.CSSProperties } = {
    quote: {
      textAlign: "right",
      fontSize: "20px",
      margin: "30px auto",
      padding: "15px",
      border: "2px solid #12b886",
      maxWidth: "70%",
      position: "relative",
    },
    blockquote: {
      textAlign: "left",
      fontStyle: "italic",
      position: "relative",
      zIndex: 20,
    },
    left: {
      position: "absolute",
      top: "-40px",
      left: "-20px",
      width: "100px",
      textAlign: "left",
      zIndex: 10,
      fontSize: "80px",
      color: "#12b886",
      backgroundColor: "whitesmoke",
      lineHeight: "90px",
    },
    right: {
      position: "absolute",
      bottom: "-50px",
      right: "-20px",
      width: "100px",
      textAlign: "right",
      zIndex: 10,
      fontSize: "80px",
      color: "#12b886",
      backgroundColor: "whitesmoke",
      lineHeight: "110px",
    },
    small: {
      fontSize: "20px",
      color: "grey",
      fontWeight: "lighter",
      marginRight: "50px",
      position: "relative",
      zIndex: 20,
    },
  }

  return (
    <div style={styles.quote}>
      <span style={styles.left}>❝</span>
      <blockquote style={styles.blockquote}>{props.quote}</blockquote>
      <small style={styles.small}>{props.author}</small>
      <span style={styles.right}>❞</span>
    </div>
  )
}

export default BlockQuote
