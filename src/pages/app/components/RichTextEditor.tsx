import React, { useCallback, useMemo } from "react"
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  CodeOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
} from "@ant-design/icons"
import isHotkey from "is-hotkey"
import { Editable, withReact, useSlate, Slate } from "slate-react"
import { Editor, Transforms, createEditor, Element as SlateElement, BaseEditor } from "slate"
import { withHistory } from "slate-history"

import { Button, Icon, Toolbar } from "./slate/components"

const HOTKEYS: { [key: string]: string } = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  "mod+`": "code",
}

const LIST_TYPES = ["numbered-list", "bulleted-list"]
const TEXT_ALIGN_TYPES = ["left", "center", "right"]

const initialEditorValue: any[] = [
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
]

const RichTextEditor = ({ readOnly, placeholder, onChange, value, ...restProps }: any) => {
  const renderElement = useCallback((props: any) => <Element {...props} />, [])
  const renderLeaf = useCallback((props: any) => <Leaf {...props} />, [])
  const editor = useMemo(() => withHistory(withReact(createEditor() as any)), [])

  return (
    <Slate
      editor={editor}
      value={typeof value === "object" ? value : JSON.parse(value || null) || initialEditorValue}
      {...restProps}
      onChange={(newValue) => {
        const isAstChange = editor.operations.some((op: any) => "set_selection" !== op.type)
        if (isAstChange) {
          const content = JSON.stringify(newValue)
          onChange(content)
        }
      }}
    >
      {!readOnly && (
        <Toolbar>
          <MarkButton format="bold" icon={<BoldOutlined />} />
          <MarkButton format="italic" icon={<ItalicOutlined />} />
          <MarkButton format="underline" icon={<UnderlineOutlined />} />
          <MarkButton format="code" icon={<CodeOutlined />} />
          <BlockButton format="heading-one" icon="H1" />
          <BlockButton format="heading-two" icon="H2" />
          <BlockButton format="heading-three" icon="H3" />
          <BlockButton format="block-quote" icon="❞" />
          <BlockButton format="numbered-list" icon={<OrderedListOutlined />} />
          <BlockButton format="bulleted-list" icon={<UnorderedListOutlined />} />
          <BlockButton format="left" icon={<AlignLeftOutlined />} />
          <BlockButton format="center" icon={<AlignCenterOutlined />} />
          <BlockButton format="right" icon={<AlignRightOutlined />} />
        </Toolbar>
      )}
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder={placeholder}
        spellCheck
        autoFocus
        readOnly={readOnly || false}
        onKeyDown={(event) => {
          for (const hotkey in HOTKEYS) {
            if (isHotkey(hotkey, event as any)) {
              event.preventDefault()
              const mark = HOTKEYS[hotkey]
              toggleMark(editor, mark)
            }
          }
        }}
        onChange={(newValue) => {
          const isAstChange = editor.operations.some((op: any) => "set_selection" !== op.type)
          if (isAstChange) {
            // Save the value to Local Storage.
            const content = JSON.stringify(newValue)
            localStorage.setItem("content", content)
          }
        }}
      />
    </Slate>
  )
}

const toggleBlock = (editor: BaseEditor, format: string) => {
  const isActive = isBlockActive(editor, format, TEXT_ALIGN_TYPES.includes(format) ? "align" : "type")
  const isList = LIST_TYPES.includes(format)

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes((n as any).type) &&
      !TEXT_ALIGN_TYPES.includes(format),
    split: true,
  })
  let newProperties: Partial<any>
  if (TEXT_ALIGN_TYPES.includes(format)) {
    newProperties = {
      align: isActive ? undefined : format,
    }
  } else {
    newProperties = {
      type: isActive ? "paragraph" : isList ? "list-item" : format,
    }
  }
  Transforms.setNodes<SlateElement>(editor, newProperties)

  if (!isActive && isList) {
    const block = { type: format, children: [] }
    Transforms.wrapNodes(editor, block)
  }
}

const toggleMark = (editor: BaseEditor, format: string) => {
  const isActive = isMarkActive(editor, format)

  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

const isBlockActive = (editor: any, format: any, blockType: string = "type") => {
  const { selection } = editor
  if (!selection) return false

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && (n as any)[blockType] === format,
    })
  )

  return !!match
}

const isMarkActive = (editor: any, format: any) => {
  const marks = Editor.marks(editor) as any
  return marks ? marks[format] === true : false
}

const Element = ({ attributes, children, element }: any) => {
  const style = { textAlign: element.align }
  switch (element.type) {
    case "block-quote":
      return (
        <blockquote style={style} {...attributes}>
          {children}
        </blockquote>
      )
    case "bulleted-list":
      return (
        <ul style={style} {...attributes}>
          {children}
        </ul>
      )
    case "heading-one":
      return (
        <h1 className="slate-heading" style={style} {...attributes}>
          {children}
        </h1>
      )
    case "heading-two":
      return (
        <h2 className="slate-heading" style={style} {...attributes}>
          {children}
        </h2>
      )
    case "heading-three":
      return (
        <h3 className="slate-heading" style={style} {...attributes}>
          {children}
        </h3>
      )
    case "list-item":
      return (
        <li style={style} {...attributes}>
          {children}
        </li>
      )
    case "numbered-list":
      return (
        <ol style={style} {...attributes}>
          {children}
        </ol>
      )
    default:
      return (
        <p style={style} {...attributes}>
          {children}
        </p>
      )
  }
}

const Leaf = ({ attributes, children, leaf }: any) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>
  }

  if (leaf.code) {
    children = <code>{children}</code>
  }

  if (leaf.italic) {
    children = <em>{children}</em>
  }

  if (leaf.underline) {
    children = <u>{children}</u>
  }

  return <span {...attributes}>{children}</span>
}

const BlockButton = ({ format, icon }: any) => {
  const editor = useSlate()
  return (
    <Button
      active={isBlockActive(editor, format, TEXT_ALIGN_TYPES.includes(format) ? "align" : "type")}
      onMouseDown={(event: any) => {
        event.preventDefault()
        toggleBlock(editor, format)
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  )
}

const MarkButton = ({ format, icon }: any) => {
  const editor = useSlate()
  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={(event: any) => {
        event.preventDefault()
        toggleMark(editor, format)
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  )
}

export default RichTextEditor
