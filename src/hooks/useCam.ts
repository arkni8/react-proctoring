import { RefObject, useEffect, useMemo, useRef, useState } from 'react'
import ProctorService from './ProctorService'

/**
 * useCam is a hook that allows you to detect faces and objects in a video stream.
 * It also tracks the user's eyes and detects if the user is looking at the camera.
 * The hook returns an object with the following properties:
 * - videoRef: a reference to the video element that the hook is controlling.
 * - violationStatus: an object with the following properties:
 *   - facesDetected: the number of faces detected in the video stream.
 *   - objectDetected: an array of strings representing the objects detected in the video stream.
 * - startWebcam: a function that starts the webcam and begins the face and object detection.
 *
 * @param {{ disabled?: boolean }} options - an object with the following properties:
 *   - disabled: a boolean indicating whether the webcam should be disabled.
 *     If set to true, the hook will not request access to the webcam and will not detect faces or objects.
 *     Defaults to false.
 *
 * @returns {{ videoRef: RefObject<HTMLVideoElement>, violationStatus: { facesDetected: number, objectDetected: string[] }, startWebcam: () => void }}
 */
export const useCam = ({ disabled }: { disabled?: boolean }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const proctorRef = useRef<typeof ProctorService>(ProctorService)

  const [violationStatus, setViolationStatus] = useState<{
    facesDetected: number
    objectDetected: string[]
  }>({
    facesDetected: 0,
    objectDetected: [],
  })

  const proctor = useMemo(() => proctorRef.current(), [])

  useEffect(() => {
    if (!disabled) {
      startWebcam()
    }

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        ;(videoRef.current.srcObject as MediaStream).getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  /**
   * Detects faces in a video stream.
   * @param videoRef a reference to the video element that the hook is controlling.
   * @returns an array of face detections, or undefined if the video stream is not ready.
   */
  const detectFaces = (videoRef: RefObject<HTMLVideoElement>) => {
    if (videoRef.current && videoRef.current.readyState >= 2 && proctor.faceDetector) {
      const detections = proctor.faceDetector.detectForVideo(videoRef.current, performance.now())
      setViolationStatus((prev) => ({ ...prev, facesDetected: detections.detections.length }))
      requestAnimationFrame(detectFaces.bind(this, videoRef))
      return detections.detections
    }
    window.requestAnimationFrame(detectFaces.bind(this, videoRef))
  }

  /**
   * Tracks eye movements in a video stream using face landmarks.
   * Continuously requests animation frames to keep detecting eye movements.
   * If face landmarks are detected, it processes the detections for eye tracking.
   * @param videoRef A reference to the video element being used for eye tracking.
   */
  const eyesTracker = (videoRef: RefObject<HTMLVideoElement>) => {
    if (videoRef.current && videoRef.current.readyState >= 2 && proctor.faceLandmarker) {
      const detections = proctor.faceLandmarker.detectForVideo(videoRef.current, performance.now())

      //   console.log(detections.faceBlendshapes)
      //   setViolationStatus((prev) => ({ ...prev, objectDetected: detections.detections.length }))
      requestAnimationFrame(eyesTracker.bind(this, videoRef))
      //   return detections.detections
    }
    requestAnimationFrame(eyesTracker.bind(this, videoRef))
  }

  /**
   * Detects objects in a video stream using the object detector.
   * Continuously requests animation frames to keep detecting objects.
   * If object detections are detected, it processes the detections and updates the violation status.
   * @param videoRef A reference to the video element being used for object detection.
   * @returns an array of object detections, or undefined if the video stream is not ready.
   */
  const objectDetection = (videoRef: RefObject<HTMLVideoElement>) => {
    if (videoRef.current && videoRef.current.readyState >= 2 && proctor.objectDetector) {
      const detections = proctor.objectDetector.detectForVideo(videoRef.current, performance.now())
      //   setViolationStatus((prev) => ({ ...prev, objectDetected: detections.detections.length }))
      setViolationStatus((prev) => {
        const categories = detections.detections.map(
          (detection) => detection.categories[0].categoryName,
        )
        return { ...prev, objectDetected: categories }
      })
      requestAnimationFrame(objectDetection.bind(this, videoRef))
      return detections.detections
    }
    requestAnimationFrame(objectDetection.bind(this, videoRef))
  }

  /**
   * Requests access to the user's webcam and starts the face detection, eye tracking and object detection.
   * @throws {Error} If there is an error accessing the user's webcam.
   */
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) videoRef.current.srcObject = stream
      detectFaces(videoRef)
      //   eyesTracker(videoRef)
      objectDetection(videoRef)
    } catch (error) {
      console.error('Error accessing webcam:', error)
    }
  }

  return {
    // startWebcam,
    violationStatus,
    videoRef,
  }
}
