import { RefObject, useEffect, useMemo, useRef, useState } from 'react'
import ProctorService from './ProctorService'

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

  const detectFaces = (videoRef: RefObject<HTMLVideoElement>) => {
    if (videoRef.current && videoRef.current.readyState >= 2 && proctor.faceDetector) {
      const detections = proctor.faceDetector.detectForVideo(videoRef.current, performance.now())
      setViolationStatus((prev) => ({ ...prev, facesDetected: detections.detections.length }))
      requestAnimationFrame(detectFaces.bind(this, videoRef))
      return detections.detections
    }
    window.requestAnimationFrame(detectFaces.bind(this, videoRef))
  }

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
