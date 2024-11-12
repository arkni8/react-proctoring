// import { useCamDetection } from "./useCamDetection";
// import { useDevToolDetection } from "./useDevToolDetection";
import {
  FullScreenStatus,
  triggerFullscreen,
  useFullScreenDetection,
} from './useFullScreenDetection'
import { useTabFocusDetection } from './useTabFocusDetection'
import { useCopyDisable } from './useCopyDisable'
import { useDisableContextMenu } from './useDisableContextMenu'
import { useSelectionDisable } from './useSelectionDisable'
import ProctorService from './ProctorService'
import { RefObject } from 'react'
import { useCam } from './useCam'

type Props = {
  preventContextMenu?: boolean
  preventUserSelection?: boolean
  preventCopy?: boolean
  forceFullScreen?: boolean
  preventTabSwitch?: boolean
  monitorCam?: boolean
}

export type ProctoringData = {
  fullScreen: { status: FullScreenStatus; trigger: VoidFunction }
  tabFocus: { status: boolean }
}

type ProctorObject = {
  fullScreen: {
    status: FullScreenStatus
    trigger: () => void
  }
  tabFocus: {
    status: boolean
  }
  camDetection: {
    violationStatus: {
      facesDetected: number
      objectDetected: string[]
    }
    videoRef: RefObject<HTMLVideoElement>
  }
}

/**
 * This hook provides a way to detect and prevent various kinds of user behaviors
 * that are deemed malicious or unwanted. It is meant to be used in an exam
 * context and will throw an error if the user tries to switch tabs, open the
 * context menu, select text, copy text, or does not have camera permissions.
 *
 * @param {Object} props
 * @param {boolean} [props.preventContextMenu=false] - Whether to disable the
 * context menu (right click menu)
 * @param {boolean} [props.preventUserSelection=false] - Whether to disable text
 * selection
 * @param {boolean} [props.preventCopy=false] - Whether to prevent text copying
 * @param {boolean} [props.forceFullScreen=false] - Whether to force the browser
 * into full screen mode
 * @param {boolean} [props.preventTabSwitch=false] - Whether to prevent the user
 * from switching tabs
 * @param {boolean} [props.monitorCam=false] - Whether to monitor the user's
 * camera for faces and objects
 *
 * @returns {ProctorObject} An object containing the following properties:
 *   - fullScreen: An object with two properties: `status` and `trigger`. The
 *     `status` property is a string indicating whether the browser is in full
 *     screen mode or not, and the `trigger` property is a function that can be
 *     called to trigger full screen mode.
 *   - tabFocus: An object with one property: `status`. The `status` property is
 *     a boolean indicating whether the user is currently focused on the current
 *     tab or not.
 *   - camDetection: An object with two properties: `violationStatus` and
 *     `videoRef`. The `violationStatus` property is an object containing two
 *     properties: `facesDetected` and `objectDetected`. The `facesDetected`
 *     property is a number indicating how many faces were detected in the
 *     camera, and the `objectDetected` property is an array of strings
 *     indicating which objects were detected in the camera. The `videoRef`
 *     property is a reference to the video element that is used for camera
 *     monitoring.
 */

export function useProctoring({
  preventTabSwitch = false,
  forceFullScreen = false,
  preventContextMenu = false,
  preventUserSelection = false,
  preventCopy = false,
  monitorCam = false,
}: Props): ProctorObject {
  useDisableContextMenu({ disabled: preventContextMenu === false })

  useCopyDisable({ disabled: preventCopy === false })
  useSelectionDisable({ disabled: preventUserSelection === false })

  // TODO: Future work
  // const { webCamStatus, videoRef, replayVideo } = useCamDetection({
  //   disabled,
  // })

  // Disabled devtools detection
  // const { devToolsOpen } = useDevToolDetection({ disabled: true })
  const { tabFocusStatus } = useTabFocusDetection({
    disabled: preventTabSwitch === false,
  })
  console.log(tabFocusStatus, 'from proctoring')
  const { fullScreenStatus } = useFullScreenDetection({
    disabled: forceFullScreen === false,
  })
  const { videoRef, violationStatus } = useCam({ disabled: monitorCam === false })

  return {
    fullScreen: { status: fullScreenStatus, trigger: triggerFullscreen },
    tabFocus: { status: tabFocusStatus },
    camDetection: { violationStatus, videoRef },
  }
}

export { ProctorService }
