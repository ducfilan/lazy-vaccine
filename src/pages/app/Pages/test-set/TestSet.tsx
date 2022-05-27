import * as React from "react"

import { getSetInfo } from "@/common/repo/set"
import { useGlobalContext } from "@/common/contexts/GlobalContext"
import { SetInfo, SetInfoItem } from "@/common/types/types"
import { Button, Card, Col, notification, Row, Skeleton } from "antd"
import { TestSetContext } from "./contexts/TestSetContext"
import { LeftOutlined } from "@ant-design/icons";
import { ItemTypes, TestQuestionAmount, TestResultLevel, TrueFalseQuestionAmount } from "@/common/consts/constants"
import { shuffleArray } from "@/common/utils/arrayUtils"
import TestTrueFalseCard from "../../components/TestTrueFalseCard"
import TestMultipleChoiceCard from "../../components/TestMultipleChoiceCard"
import { useRef } from "react"

const { useState, useEffect } = React
const i18n = chrome.i18n.getMessage

const TestSetPage = (props: any) => {
  const { http } = useGlobalContext()
  const [setInfo, setSetInfo] = useState<SetInfo>()
  const [loading, setLoading] = useState<boolean>(true)
  const [trueFalseQuestions, setTrueFalseQuestions] = useState<SetInfoItem[]>([])
  const [multipleChoiceQuestions, setMultipleChoiceQuestions] = useState<SetInfoItem[]>([])
  const [finalResult, setFinalResult] = useState<number | null>(null)
  const [commentTitle, setCommentTitle] = useState<string>()
  const [commentDetail, setCommentDetail] = useState<string>()
  let trueFalseCardRefs = useRef<any>([]);
  let multipleChoiceCardRefs = useRef<any>([]);

  function handleSetInfo(set: SetInfo) {
    if (!set.items) {
      return
    }
    let termDefItems: SetInfoItem[] = [], qaItems: SetInfoItem[] = []
    setSetInfo(set)
    set.items.map(item => {
      switch (item.type) {
        case ItemTypes.TermDef.value:
          termDefItems.push(item)
          break
        case ItemTypes.QnA.value:
          qaItems.push(item)
          break
        default:
          termDefItems.push(item)
          break
      }
    })

    //handle case have no qa question
    const trueFalseQuestionAmount = qaItems.length === 0 ? TestQuestionAmount : TrueFalseQuestionAmount
    let trueFalseItems = shuffleArray(termDefItems).slice(0, trueFalseQuestionAmount).map(item => {
      const randomResult: boolean = Math.random() < 0.5
      return {
        ...item,
        defOption: randomResult ? item.definition : termDefItems.slice(trueFalseQuestionAmount + 1)[Math.floor(Math.random() * (termDefItems.length - trueFalseQuestionAmount))].definition,
        answer: randomResult,
        selectedAnswer: null
      }
    });
    setTrueFalseQuestions(trueFalseItems)
    setMultipleChoiceQuestions(qaItems.slice(0, TestQuestionAmount - trueFalseItems.length))
  }
  function onPageLoaded() {
    if (!http) return

    getSetInfo(http, props.match.params.setId)
      .then((res) => handleSetInfo(res))
      .catch(() => {
        notification["error"]({
          message: chrome.i18n.getMessage("error"),
          description: chrome.i18n.getMessage("unexpected_error_message"),
          duration: null,
        })
      })
  }

  const goBack = () => {
    props.history.goBack();
  }

  const checkResult = () => {
    let result: number = 0
    //check result true-false card
    for (let ref of trueFalseCardRefs.current) {
      if (checkTrueFalseCardResult(ref.getSetItem())) {
        result++
      }
    }
    //check result multiple-choice card
    for (let ref of multipleChoiceCardRefs.current) {
      if (checkMultipleChoiceCardResult(ref.getSetItem())) {
        result++
      }
    }
    const correctness = result / TestQuestionAmount
    let commentTitle, commentDetail
    if (correctness >= TestResultLevel.High) {
      commentTitle = chrome.i18n.getMessage("high_comment_title")
      commentDetail = chrome.i18n.getMessage("high_comment_detail")
    } else if (correctness < TestResultLevel.High && correctness >= TestResultLevel.Medium) {
      commentTitle = chrome.i18n.getMessage("medium_comment_title")
      commentDetail = chrome.i18n.getMessage("medium_comment_detail")
    } else {
      commentTitle = chrome.i18n.getMessage("low_comment_title")
      commentDetail = chrome.i18n.getMessage("low_comment_detail")
    }
    setCommentTitle(commentTitle)
    setCommentDetail(commentDetail)
    setFinalResult(result)
  }

  function checkTrueFalseCardResult(itemInfo: any): boolean {
    return itemInfo?.selectedAnswer === itemInfo?.answer
  }

  function checkMultipleChoiceCardResult(itemInfo: any): boolean {
    let isCorrected = true
    itemInfo?.answers.map((answer: any) => {
      if ((answer?.selectedAnswer !== null && answer?.selectedAnswer !== answer?.isCorrect) || (answer?.selectedAnswer === null && answer?.isCorrect)) {
        isCorrected = false
      }
    })
    return isCorrected
  }

  useEffect(onPageLoaded, [http])
  useEffect(() => setInfo && setLoading(false), [setInfo])

  return (
    <TestSetContext.Provider value={{}}>
      <Skeleton active loading={loading}>
        <Row justify="start">
          <Col span={4}>
            <Button type="link" icon={<LeftOutlined />} onClick={goBack}>
              {setInfo?.name} {i18n("common_test")}
            </Button>
          </Col>
        </Row>
        {finalResult === null ? <div style={{ width: '60%', margin: '0 auto' }}>
          {trueFalseQuestions && trueFalseQuestions.map((item, index) => <TestTrueFalseCard setItem={item} key={index} ref={ref => trueFalseCardRefs.current[index] = ref} />)}
          {multipleChoiceQuestions && multipleChoiceQuestions.map((item, index) => <TestMultipleChoiceCard setItem={item} key={index} ref={ref => multipleChoiceCardRefs.current[index] = ref} />)}
          <Row justify="center">
            <Button
              type="primary"
              size="middle"
              className="top-16px"
              onClick={() => checkResult()}
            >
              {i18n("check_result_button")}
            </Button>
          </Row>
        </div> : <div className="result-wrapper">
          <Card title={`${finalResult} / ${TestQuestionAmount} `} bordered={false} style={{ width: '60%', textAlign: 'center', fontSize: '36px' }}>
            <p className="comment-title">{commentTitle}</p>
            <p className="comment-detail">{commentDetail}</p>
          </Card>
        </div>}

      </Skeleton>
    </TestSetContext.Provider>
  )
}

export default TestSetPage
