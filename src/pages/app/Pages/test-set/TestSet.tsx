import React, { useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"

import { getSetInfo, uploadTestResult } from "@/common/repo/set"
import { useGlobalContext } from "@/common/contexts/GlobalContext"
import { SetInfo, SetInfoItem, TestResult } from "@/common/types/types"
import { Button, Card, Col, notification, Result, Row, Skeleton, Statistic, Typography } from "antd"
import { TestSetContext } from "./contexts/TestSetContext"
import { LeftOutlined, ArrowUpOutlined } from "@ant-design/icons"
import { i18n, ItemTypes, TestQuestionAmount, TestResultLevel, TrueFalseQuestionAmount } from "@/common/consts/constants"
import { shuffleArray } from "@/common/utils/arrayUtils"
import TestTrueFalseCard from "../../components/TestTrueFalseCard"
import TestMultipleChoiceCard from "../../components/TestMultipleChoiceCard"
import shibaLoveIcon from "@img/emojis/shiba/love.png"
import CongratsScreen from "@/pages/app/components/CongratsScreen"
import { TrackingNameOpenTestPage } from "@/common/consts/trackingNames"
import { track } from "@amplitude/analytics-browser"

const { useState, useEffect } = React

const TestSetPage = (props: any) => {
  const { http } = useGlobalContext()
  const [setInfo, setSetInfo] = useState<SetInfo>()
  const [loading, setLoading] = useState<boolean>(true)
  const [trueFalseQuestions, setTrueFalseQuestions] = useState<SetInfoItem[] | any[]>([])
  const [multipleChoiceQuestions, setMultipleChoiceQuestions] = useState<SetInfoItem[]>([])
  const [finalResult, setFinalResult] = useState<number | null>(null)
  const [commentTitle, setCommentTitle] = useState<string>()
  const [commentDetail, setCommentDetail] = useState<string>()
  let trueFalseCardRefs = useRef<any>([])
  let multipleChoiceCardRefs = useRef<any>([])

  useEffect(() => {
    track(TrackingNameOpenTestPage)
  }, [])

  const { setId } = useParams()
  const navigate = useNavigate()

  function handleSetInfo(set: SetInfo) {
    if (!set.items) {
      return
    }
    let termDefItems: SetInfoItem[] = [],
      qaItems: SetInfoItem[] = []
    setSetInfo(set)
    set.items.forEach((item) => {
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

    termDefItems = shuffleArray(termDefItems)
    //handle case have no qa question
    const qaItemsAmount = qaItems.length
    const trueFalseQuestionAmount = qaItems.length === 0 ? TestQuestionAmount : TrueFalseQuestionAmount
    let trueFalseItems = termDefItems.slice(0, trueFalseQuestionAmount).map((item, idx) => {
      if (idx >= TestQuestionAmount / 2 && qaItemsAmount === 0) {
        let randomDefinitions = shuffleArray(termDefItems.slice(trueFalseQuestionAmount + 1))
          .slice(0, 3)
          .map((randomItem) => {
            return {
              isCorrect: false,
              answer: randomItem.definition,
            }
          })
        qaItems.push({
          ...item,
          type: ItemTypes.QnA.value,
          question: item.term,
          answers: shuffleArray([
            {
              isCorrect: true,
              answer: item.definition,
            },
            ...randomDefinitions,
          ]),
        })
        return
      }
      const randomResult: boolean = Math.random() < 0.5
      return {
        ...item,
        defOption: randomResult
          ? item.definition
          : termDefItems.slice(trueFalseQuestionAmount + 1)[
              Math.floor(Math.random() * (termDefItems.length - trueFalseQuestionAmount))
            ].definition,
        answer: randomResult,
        selectedAnswer: null,
      }
    })
    setTrueFalseQuestions(trueFalseItems)
    setMultipleChoiceQuestions(
      qaItems.slice(0, TestQuestionAmount - (qaItemsAmount === 0 ? TrueFalseQuestionAmount : trueFalseItems.length))
    )
  }
  function onPageLoaded() {
    if (!http) return

    getSetInfo(http, setId!)
      .then((res) => handleSetInfo(res))
      .catch(() => {
        notification["error"]({
          message: i18n("error"),
          description: i18n("unexpected_error_message"),
          duration: null,
        })
      })
  }

  const goBack = () => {
    navigate(-1)
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
      commentTitle = i18n("high_comment_title")
      commentDetail = i18n("high_comment_detail")
    } else if (correctness < TestResultLevel.High && correctness >= TestResultLevel.Medium) {
      commentTitle = i18n("medium_comment_title")
      commentDetail = i18n("medium_comment_detail")
    } else {
      commentTitle = i18n("low_comment_title")
      commentDetail = i18n("low_comment_detail")
    }
    setCommentTitle(commentTitle)
    setCommentDetail(commentDetail)
    setFinalResult(result)
    if (!http) {
      return
    }
    const testResult: TestResult = {
      result: { total: TestQuestionAmount, score: result },
    }
    uploadTestResult(http, setId!, testResult)
      .then(() => {})
      .catch(() => {
        notification["error"]({
          message: i18n("error"),
          description: i18n("unexpected_error_message"),
          duration: null,
        })
      })
  }

  function checkTrueFalseCardResult(itemInfo: any): boolean {
    return itemInfo?.selectedAnswer === itemInfo?.answer
  }

  function checkMultipleChoiceCardResult(itemInfo: any): boolean {
    let isCorrected = true
    itemInfo?.answers.map((answer: any) => {
      if (
        (answer?.selectedAnswer !== null && answer?.selectedAnswer !== answer?.isCorrect) ||
        (answer?.selectedAnswer === null && answer?.isCorrect)
      ) {
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
              {i18n("common_back")}
            </Button>
          </Col>
        </Row>

        {finalResult === null ? (
          <>
            <Result
              style={{ paddingTop: 0, background: "#fff", borderRadius: 5, margin: "20px 0" }}
              icon={<img src={shibaLoveIcon} />}
              title={`${setInfo?.name} ${i18n("common_test")}`}
              subTitle={i18n("test_set_encourage_test")}
            />
            <div style={{ width: "60%", margin: "0 auto" }}>
              {trueFalseQuestions &&
                trueFalseQuestions.map(
                  (item, index) =>
                    item && (
                      <TestTrueFalseCard
                        setItem={item}
                        key={index}
                        ref={(ref) => (trueFalseCardRefs.current[index] = ref)}
                      />
                    )
                )}
              {multipleChoiceQuestions &&
                multipleChoiceQuestions.map((item, index) => (
                  <TestMultipleChoiceCard
                    setItem={item}
                    key={index}
                    ref={(ref) => (multipleChoiceCardRefs.current[index] = ref)}
                  />
                ))}
              <Row justify="center">
                <Button type="primary" size="large" className="top-16px" onClick={() => checkResult()} block>
                  {i18n("check_result_button")}
                </Button>
              </Row>
            </div>
          </>
        ) : (
          <CongratsScreen
            innerContent={
              <div className="result-wrapper">
                <Card
                  title={<Typography.Title>{`${finalResult} / ${TestQuestionAmount}`}</Typography.Title>}
                  bordered={false}
                  style={{ width: "60%", textAlign: "center", fontSize: "36px" }}
                >
                  <p className="comment-title">{commentTitle}</p>
                  <p className="comment-detail">{commentDetail}</p>
                </Card>

                <Card
                  title={<Typography.Title>Reward</Typography.Title>}
                  bordered={false}
                  style={{ width: "60%", textAlign: "center", fontSize: "36px" }}
                >
                  <Statistic
                    title={<p style={{ fontSize: 24, fontWeight: 600, color: "#000" }}>You've earned</p>}
                    value={11.28}
                    precision={2}
                    valueStyle={{ color: "#3f8600" }}
                    prefix={<ArrowUpOutlined />}
                    suffix="LZV"
                  />
                </Card>
              </div>
            }
          />
        )}
      </Skeleton>
    </TestSetContext.Provider>
  )
}

export default TestSetPage
