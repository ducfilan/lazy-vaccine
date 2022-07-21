import React from "react"
import { gsap } from "gsap"

const settings = {
  colors: {
    background: "#fff",
    fill: "#12b886",
    stroke: "#446A46",
  },
  animation: {
    height: window.innerHeight,
    width: window.innerWidth,
    maxPlantCount: 8,
    minPlantCount: 6,
  },
  plant: {
    maxHeight: 0.8, // relative to the animation size
    minHeight: 0.3,
    minNodes: 3,
    maxNodes: 6,
    strokeWidth: window.innerHeight < 300 ? 1.25 : 2,
  },
  durations: {
    leaf: 0.14, // relative to the element size
    stem: 0.032,
  },
  isAnimationOk: window.matchMedia("(prefers-reduced-motion: no-preference)").matches,
}

const utils = {
  getRandFromRange: function (min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  },
}

export class TreeGrow extends React.Component<any, any> {
  height: number
  width: number
  plantCount: number
  margin: number
  plantSection: number
  timeline: any

  constructor(props: any) {
    super(props)

    this.state = { key: Math.random() }

    this.height = props.height || settings.animation.height
    this.width = props.width || settings.animation.width

    this.plantCount = 0
    this.plantSection = 0
    this.margin = 0

    this.setAnimationVars()
  }

  setAnimationVars = () => {
    this.plantCount = utils.getRandFromRange(settings.animation.minPlantCount, settings.animation.maxPlantCount)
    this.margin = (this.height * settings.plant.maxHeight) / settings.plant.maxNodes
    this.plantSection = (this.width - 2 * this.margin) / this.plantCount
    this.timeline = gsap.timeline()
  }

  update = () => {
    this.setState({ key: Math.random() })
    this.setAnimationVars()
  }

  render() {
    return (
      <React.Fragment>
        <svg
          className="scene"
          key={this.state.key}
          stroke={settings.colors.stroke}
          strokeWidth={settings.plant.strokeWidth}
          strokeLinecap="round"
          viewBox={`0 0 ${this.width} ${this.height}`}
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMax slice"
          style={{ paddingTop: 100, background: "#fff" }}
        >
          <rect x={0} y={0} height={this.height} width={this.width} fill={settings.colors.background} stroke={"none"} />
          {[...Array(this.plantCount)].map((e, i) => {
            return (
              <Plant
                key={"plant-" + i}
                id={i}
                x={this.margin + (i + 0.5) * this.plantSection}
                y={this.height}
                parentTimeline={this.timeline}
                maxHeight={this.height * settings.plant.maxHeight}
                minHeight={this.height * settings.plant.minHeight}
              />
            )
          })}
        </svg>
      </React.Fragment>
    )
  }
}

class Plant extends React.Component<any> {
  id: any
  x: any
  y: any
  minHeight: any
  maxHeight: any
  parentTimeline: any
  height: number
  nodes: number
  stemDuration: number
  plantDelay: number
  step: number
  stem: any
  timeline: any
  constructor(props: any) {
    super(props)

    this.id = props.id
    this.x = props.x
    this.y = props.y
    this.minHeight = props.minHeight
    this.maxHeight = props.maxHeight
    this.parentTimeline = props.parentTimeline

    this.height = utils.getRandFromRange(this.minHeight, this.maxHeight)
    this.nodes = utils.getRandFromRange(settings.plant.minNodes, settings.plant.maxNodes)
    this.stemDuration = this.height * settings.durations.stem
    this.plantDelay = Math.random() * 2
    this.step = this.height / this.nodes

    this.stem = null

    this.timeline = gsap.timeline()
  }

  componentDidMount() {
    if (settings.isAnimationOk) {
      this.timeline.fromTo(this.stem, { y: this.y }, { duration: this.stemDuration, y: 0 }, `<+${this.plantDelay}`)

      this.parentTimeline.add(this.timeline, "<")
    }
  }

  render() {
    return (
      <g className="plant">
        <path
          className="stem"
          d={`M ${this.x} ${this.y} L ${this.x} ${this.y - this.height}`}
          ref={(path) => (this.stem = path)}
        />
        {[...Array(this.nodes)].map((e, i) => {
          let y = this.y - this.step * (i + 1)
          let size = this.height * 0.35 - this.height * 0.045 * i
          let delay = (this.stemDuration / this.nodes) * (i + 1)

          return (
            <g className="leaves" key={"leaf-group-" + i}>
              <Leaf
                x={this.x}
                y={y}
                size={size}
                side={1}
                id={this.id + "-" + i + "L"}
                parentTimeline={this.timeline}
                delay={delay + this.plantDelay}
              />
              <Leaf
                x={this.x}
                y={y}
                size={size}
                side={-1}
                id={this.id + "-" + i + "R"}
                parentTimeline={this.timeline}
                delay={delay + this.plantDelay}
              />
            </g>
          )
        })}
      </g>
    )
  }
}

class Leaf extends React.Component<any> {
  id: any
  x: any
  y: any
  size: any
  side: any
  delay: any
  parentTimeline: any
  hasSolidFill: boolean
  hasMainStem: boolean
  hasLeftSide: any
  hasRightSide: any
  rotation: number
  substemSpacing: number
  substemCount: number
  leaf: any
  stem: any
  substems: any
  timeline: any
  constructor(props: any) {
    super(props)

    this.id = props.id
    this.x = props.x
    this.y = props.y
    this.size = props.size
    this.side = props.side
    this.delay = props.delay
    this.parentTimeline = props.parentTimeline

    this.getLeafPath = this.getLeafPath.bind(this)
    this.getLeafStem = this.getLeafStem.bind(this)
    this.getLeafSubstems = this.getLeafSubstems.bind(this)

    this.hasSolidFill = Math.random() > 0.75
    this.hasMainStem = !this.hasSolidFill && Math.random() > 0.3
    this.hasLeftSide = this.hasMainStem && Math.random() > 0.65
    this.hasRightSide = this.hasMainStem && Math.random() > 0.65
    this.rotation = utils.getRandFromRange(40, 70) * this.side

    this.substemSpacing = 4 * settings.plant.strokeWidth
    this.substemCount = Math.floor(this.size / this.substemSpacing / settings.plant.strokeWidth)

    this.leaf = null
    this.stem = null
    this.substems = {
      "1": new Array(this.substemCount),
      "-1": new Array(this.substemCount),
    }

    this.timeline = gsap.timeline()
  }

  componentDidMount() {
    if (settings.isAnimationOk) {
      const duration = this.size * settings.durations.leaf

      gsap.set(this.leaf, { transformOrigin: "50% 100%" })

      this.timeline.from(this.leaf, {
        duration: duration * 1.1,
        delay: this.delay,
        ease: "power4.out",
        rotation: 0,
        scale: 0,
      })

      this.parentTimeline.add(this.timeline, "<")
    }
  }

  getLeafPath() {
    const middle = this.size / 2
    const width = this.size / 3

    return `M ${this.x} ${this.y} Q ${this.x - width} ${this.y - middle} ${this.x} ${this.y - this.size} Q ${
      this.x + width
    } ${this.y - middle} ${this.x} ${this.y} Z`
  }

  getLeafStem() {
    return (
      <path
        className="leaf-stem"
        d={`M ${this.x} ${this.y} L ${this.x} ${this.y - this.size}`}
        ref={(path) => (this.stem = path)}
      />
    )
  }

  getLeafSubstems(side: any) {
    return (
      <g className="petalStems" clipPath={`url(#leaf-${this.id})`}>
        {[...Array(this.substemCount)].map((e, i) => {
          let yStart = this.y - (i * this.substemSpacing * settings.plant.strokeWidth + this.substemSpacing)
          let yEnd = yStart - 10 * settings.plant.strokeWidth

          return (
            <path
              key={this.id + "-substem-" + i}
              ref={(e) => (this.substems[side][i] = e)}
              d={`M ${this.x} ${yStart} L ${this.x + (this.size / 6) * side} ${yEnd}`}
            />
          )
        })}
      </g>
    )
  }

  render() {
    const leafPath = this.getLeafPath()
    const leafStem = this.hasMainStem ? this.getLeafStem() : null
    const leftSide = this.hasLeftSide ? this.getLeafSubstems(-1) : null
    const rightSide = this.hasRightSide ? this.getLeafSubstems(1) : null

    return (
      <g className="leaf" transform={`rotate(${this.rotation} ${this.x} ${this.y})`} ref={(path) => (this.leaf = path)}>
        <defs>
          <clipPath id={`leaf-${this.id}`} clipPathUnits="userSpaceOnUse">
            <path d={leafPath} />
          </clipPath>
        </defs>
        <path
          className="outline"
          d={leafPath}
          fill={this.hasSolidFill ? settings.colors.stroke : settings.colors.fill}
        />
        {leafStem}
        {leftSide}
        {rightSide}
      </g>
    )
  }
}
