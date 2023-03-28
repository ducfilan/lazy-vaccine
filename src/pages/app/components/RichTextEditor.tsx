import React, { useCallback, useMemo, useState } from "react"
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
  FileImageOutlined,
  LoadingOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons"
import isHotkey from "is-hotkey"
import { Editable, withReact, useSlate, Slate, useSlateStatic, ReactEditor, useSelected, useFocused } from "slate-react"
import { Editor, Transforms, createEditor, Element as SlateElement, BaseEditor } from "slate"
import { withHistory } from "slate-history"
import isUrl from "is-url"
import imageExtensions from "image-extensions"
import Resizer from "react-image-file-resizer"

import { Button, Icon, Toolbar } from "./slate/components"
import { ImageElement, UploadImageResponse } from "@/common/types/types"
import { css } from "@emotion/css"
import { i18n, StaticBaseUrl } from "@/common/consts/constants"
import { Modal, Upload, Tabs, Input } from "antd"
import { RcFile, UploadChangeParam, UploadFile } from "antd/lib/upload/interface"
import { getExtensionFromFileType, getHash } from "@/common/utils/stringUtils"
import { getPreSignedUploadUrl, uploadImage } from "@/common/repo/image"
import { useGlobalContext } from "@/common/contexts/GlobalContext"

const HOTKEYS: { [key: string]: string } = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  "mod+`": "code",
}

const LIST_TYPES = ["numbered-list", "bulleted-list"]
const TEXT_ALIGN_TYPES = ["left", "center", "right"]

const initEditorValue = (value: any): any[] => [
  {
    type: "paragraph",
    children: [{ text: value || "" }],
  },
]

const RichTextEditor = ({ readOnly, placeholder, onChange, value, ...restProps }: any) => {
  const renderElement = useCallback((props: any) => <Element {...props} />, [])
  const renderLeaf = useCallback((props: any) => <Leaf {...props} />, [])
  const editor = useMemo(() => withImages(withHistory(withReact(createEditor() as ReactEditor))), [])

  if (typeof value !== "object") {
    try {
      if (!value) value = initEditorValue(value)
      else value = JSON.parse(value || null)
    } catch (error) {
      value = initEditorValue(value)
    }
  }

  editor.children = value

  return (
    <Slate
      editor={editor}
      value={value}
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
          <InsertImageButton />
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

const Element = (props: any) => {
  const { attributes, children, element } = props
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

    case "image":
      return <Image {...props} />

    default:
      return (
        <span style={style} {...attributes}>
          {children}
        </span>
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

const withImages = (editor: any) => {
  const { insertData, isVoid } = editor

  editor.isVoid = (element: any) => {
    return element.type === "image" ? true : isVoid(element)
  }

  editor.insertData = (data: any) => {
    const text = data.getData("text/plain")
    const { files } = data

    if (files && files.length > 0) {
      for (const file of files) {
        const reader = new FileReader()
        const [mime] = file.type.split("/")

        if (mime === "image") {
          reader.addEventListener("load", () => {
            const url = reader.result
            url && typeof url === "string" && insertImage(editor, url)
          })

          reader.readAsDataURL(file)
        }
      }
    } else if (isImageUrl(text)) {
      insertImage(editor, text)
    } else {
      insertData(data)
    }
  }

  return editor
}

const insertImage = (editor: any, url: string) => {
  const text = { text: "" }
  const image: ImageElement = { type: "image", url, children: [text] }
  Transforms.insertNodes(editor, image)
}

const Image = ({ attributes, children, element }: any) => {
  const editor = useSlateStatic() as ReactEditor
  const path = ReactEditor.findPath(editor, element)
  const style = { textAlign: element.align }

  const selected = useSelected()
  const focused = useFocused()
  return (
    <div style={style} {...attributes}>
      {children}
      <div
        contentEditable={false}
        className={css`
          position: relative;
          padding: 10px;
        `}
      >
        <img
          src={element.url}
          className={css`
            max-width: 100%;
            max-height: 50em;
            box-shadow: ${selected && focused ? "0 0 0 3px #B4D5FF" : "none"};
          `}
        />
        <Button
          active
          onClick={() => Transforms.removeNodes(editor, { at: path })}
          className={css`
            display: ${selected && focused ? "inline" : "none"};
            position: absolute;
            top: 0.5em;
            left: 0.5em;
            background-color: white;
          `}
        >
          <Icon
            className={css`
              padding: 10px;
            `}
          >
            <DeleteOutlined />
          </Icon>
        </Button>
      </div>
    </div>
  )
}

const InsertImageButton = () => {
  const { user, http } = useGlobalContext()

  const imageMaxWidthInPx = 1000

  const editor = useSlateStatic()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [uploadingImage, setUploadingImage] = useState<boolean>(false)
  const [imageUrl, setImageUrl] = useState<string>("")
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null)
  const [imageRatio, setImageRatio] = useState<number>(1)

  const resizeAndCompressImage = (file: File) =>
    new Promise((resolve) => {
      Resizer.imageFileResizer(
        file,
        imageSize?.width || 0 > imageMaxWidthInPx ? imageMaxWidthInPx : imageSize?.width!,
        imageSize?.width || 0 > imageMaxWidthInPx ? imageMaxWidthInPx / imageRatio : imageSize?.height!,
        "JPEG",
        80,
        0,
        (uri) => {
          resolve(uri)
        },
        "file"
      )
    })

  const getUploadFileInfo = async (file: RcFile) => {
    if (!http || !user) return

    const ext = getExtensionFromFileType(file.type)

    // TODO: Hash on server side.
    const uniqueFileName = `${getHash(user?.email)}_${getHash(file.name)}_${new Date().getTime()}.${ext}`

    const url = await getPreSignedUploadUrl(http, uniqueFileName, file.type)

    return { preSignedUrl: url, fileName: uniqueFileName, fileType: file.type }
  }

  const checkImageDimension = (file: RcFile): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.addEventListener("load", (event) => {
        const _loadedImageUrl = event.target?.result
        const image = document.createElement("img")
        image.src = _loadedImageUrl as string

        image.addEventListener("load", () => {
          const { width, height } = image

          setImageSize({ width, height })
          setImageRatio(width / height)

          resolve(true)
        })
      })
    })
  }

  const onImageUploaderChange = (info: UploadChangeParam<UploadFile<UploadImageResponse>>) => {
    if (info.file.status === "uploading") {
      setUploadingImage(true)
      return
    }

    if (info.file.status === "done") {
      setUploadingImage(false)
    }
  }

  const onImageUpload = async (info: any) => {
    const { preSignedUrl, fileName, fileType } = (await getUploadFileInfo(info.file)) || {}

    if (!preSignedUrl) return

    const file = await resizeAndCompressImage(info.file)

    const isUploadSuccess = await uploadImage(preSignedUrl, file, {
      headers: {
        "x-amz-acl": "public-read",
        "Content-Type": fileType!,
      },
    })

    if (isUploadSuccess) {
      setUploadingImage(false)
      const imgUrl = `${StaticBaseUrl}/${fileName}`
      setImageUrl(imgUrl)
    }
  }

  const uploadButton = (
    <div>
      {uploadingImage ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>{i18n("common_upload")}</div>
    </div>
  )

  return (
    <>
      <Button
        onMouseDown={(event: MouseEvent) => {
          event.preventDefault()
          setIsModalVisible(true)
        }}
      >
        <Icon>
          <FileImageOutlined />
        </Icon>
      </Button>

      <Modal
        title={i18n("rich_text_upload_modal_title")}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => {
          setIsModalVisible(false)
          imageUrl && insertImage(editor, imageUrl)
        }}
        cancelText={i18n("common_cancel")}
      >
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab={i18n("rich_text_insert_url_title")} key="1">
            <Input
              addonBefore={i18n("rich_text_image_url")}
              value={imageUrl}
              allowClear
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab={i18n("rich_text_upload_tab_title")} key="2">
            <Upload
              listType="picture-card"
              showUploadList={false}
              accept="image/jpeg,image/png"
              method="PUT"
              beforeUpload={checkImageDimension}
              onChange={onImageUploaderChange}
              customRequest={onImageUpload}
            >
              {imageUrl ? <img src={imageUrl} style={{ width: "100%" }} /> : uploadButton}
            </Upload>
          </Tabs.TabPane>
        </Tabs>
      </Modal>
    </>
  )
}

const isImageUrl = (url: string) => {
  if (!url) return false
  if (!isUrl(url)) return false
  const ext = new URL(url).pathname.split(".").pop()
  return ext && imageExtensions.includes(ext)
}

export default RichTextEditor
