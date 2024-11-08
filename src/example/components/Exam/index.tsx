import React, { useEffect, useMemo, useRef, useState } from 'react'
import questions from './questions'
import ProctorService from '../../../hooks/ProctorService'
import { useCam } from '../../../hooks/useCam'
import ExamPaused from './ExamPaused'

type Props = {}

const Exam = (props: Props) => {
  const { videoRef, violationStatus } = useCam()



  return (
    <>
      <video ref={videoRef} autoPlay playsInline></video>
      {/* {violationStatus.facesDetected > 1 && <span style={{ color: "red" }}>{violationStatus.facesDetected} faces detected</span>} */}

      {violationStatus.facesDetected < 1 || violationStatus.facesDetected > 1 || violationStatus.objectDetected.filter((object) => object !== "person").length > 0 ? <ExamPaused /> :
        <div
          style={{
            padding: '12px 32px',
            backgroundColor: '#cbffcc',
          }}
        >
          <h1 style={{ textAlign: 'center' }}>Exam in progress!</h1>

          {questions.map((q, i) => (
            <div className="question">
              <h4>Question {i + 1}</h4>
              <p style={{ whiteSpace: 'pre-wrap' }}>{q.text}</p>
              {q.options.map((option) => (
                <>
                  <input
                    style={{ marginInlineEnd: 8, marginBottom: 8 }}
                    type="radio"
                    id={option}
                    name={`question${q.id}`}
                    value={option}
                  />
                  <label htmlFor="html">{option}</label>
                  <br />
                </>
              ))}
            </div>
          ))}
        </div>
      }
    </>
  )
}

export default Exam
