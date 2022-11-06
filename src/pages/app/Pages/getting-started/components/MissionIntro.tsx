import FriendRoad from "@/pages/app/components/FriendRoad"
import React from "react"

export default function MissionIntro() {
  return (
    <>
      <div className="mission-intro--wrapper is-relative">
        <FriendRoad
          steps={[
            {
              title: "Login",
              description: "Then I know how to call your name",
            },
            {
              title: "Languages",
              description: "Let me know which languages to help you",
            },
            {
              title: "Subscribe",
              description: "So I can help you learn what you will choose",
            },
            {
              title: "Final",
              description: "I am your buddy when you are online!",
            },
          ]}
        />
      </div>
    </>
  )
}
