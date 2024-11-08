import {
  FaceDetector,
  FaceLandmarker,
  FilesetResolver,
  ObjectDetector,
} from '@mediapipe/tasks-vision'

class ProctorService {
  faceDetector?: FaceDetector
  faceLandmarker?: FaceLandmarker
  objectDetector?: ObjectDetector
  private eyeTracker: any
  private vision: any
  static instance: ProctorService

  violations = {
    facesDetected: 0,
  }

  constructor() {
    this.initVision()
  }

  private async initVision() {
    this.vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
    )
    this.faceDetector = await FaceDetector.createFromOptions(this.vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/latest/blaze_face_short_range.tflite',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
    })
    this.faceLandmarker = await FaceLandmarker.createFromOptions(this.vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task',
        delegate: 'CPU',
      },
      runningMode: 'VIDEO',
      numFaces: 1,
    })

    this.objectDetector = await ObjectDetector.createFromOptions(this.vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-tasks/object_detector/efficientdet_lite0_uint8.tflite',
        delegate: 'CPU',
      },
      runningMode: 'VIDEO',
      scoreThreshold: 0.2,
    })
  }

  // async trackEyes(imageData: any): Promise<any> {
  //   const image = await Image.create(imageData)
  //   const detections = await this.eyeTracker.detect(image)
  //   image.delete()
  //   return detections.landmarks
  // }

  // async startWebcam(videoRef: RefObject<HTMLVideoElement>): Promise<void> {
  //   try {
  //     const stream = await navigator.mediaDevices.getUserMedia({ video: true })
  //     if (videoRef.current) videoRef.current.srcObject = stream
  //     this.detectFaces(videoRef)
  //   } catch (error) {
  //     console.error('Error accessing webcam:', error)
  //   }
  // }

  static getInstance() {
    if (!ProctorService.instance) {
      ProctorService.instance = new ProctorService()
    }
    return ProctorService.instance
  }
}

export default ProctorService.getInstance
