import * as React from "react"

import { Navbar as BulmaNavbar, Image } from "react-bulma-components"

import logo from "../../images/ui/logo.png"

const { Brand, Item, Menu } = BulmaNavbar

function Navbar({ isLoggedIn }: any) {
  return (
    <BulmaNavbar color="primary">
      <Brand>
        <figure className="image is-48x48 logo">
          <Image src={logo} rounded />
        </figure>
        <Item renderAs="h4" className="title is-4 is-marginless has-text-centered is-overlay brand-name is-uppercase">
          {chrome.i18n.getMessage("appName")}
        </Item>

        <a className="navbar-burger" role="button" data-target="navMenu" aria-label="menu" aria-expanded="false">
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </Brand>

      {isLoggedIn && (
        <Menu id="navMenu">
          <div className="navbar-end">
            <Item className="is-capitalized" id="button-logout" href="#">
              {chrome.i18n.getMessage("logout")}
            </Item>
          </div>
        </Menu>
      )}
    </BulmaNavbar>
  )
}

export default Navbar
