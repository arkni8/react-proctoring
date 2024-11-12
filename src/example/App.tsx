import Alerts from './components/Alerts'
import { useProctoring } from '../hooks/useProctoring'
import './global.css'
import { useState } from 'react'
import ExamIntro from './components/Exam/ExamIntro'
import ExamPaused from './components/Exam/ExamPaused'
import Exam from './components/Exam'

function App() {
  const [examHasStarted, setExamHasStarted] = useState(false)

  const { fullScreen, tabFocus, camDetection } = useProctoring({
    forceFullScreen: true,
    preventTabSwitch: true,
    preventContextMenu: true,
    preventUserSelection: true,
    preventCopy: true,
    monitorCam: true,
  })

  if (!examHasStarted) {
    return (
      <ExamIntro
        onClick={() => {
          fullScreen.trigger()
          // Wait before react finishes updating state. flushSync doesn't seem to work
          setTimeout(() => {
            setExamHasStarted(true)
          }, 100)
        }}
      />
    )
  }

  const getContent = () => {
    debugger
    if (fullScreen.status === 'off') return <ExamPaused />
    if (tabFocus.status === false) return <ExamPaused />

    return <Exam violationStatus={camDetection.violationStatus} />
  }

  return (
    <>
      {/* For debugging purpose */}
      {/* <pre>{JSON.stringify({ fullScreen, tabFocus }, null, 2)}</pre> */}
      <video ref={camDetection.videoRef} autoPlay playsInline></video>
      <div className="test-container">{getContent()}</div>

      <Alerts fullScreen={fullScreen} tabFocus={tabFocus} />
    </>
  )
}

export default App
