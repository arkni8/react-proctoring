import {
  FaceDetector,
  FaceLandmarker,
  FilesetResolver,
  ObjectDetector,
} from '@mediapipe/tasks-vision'

/**
 * The `ProctorService` class in TypeScript initializes and manages instances of face detection, face
 * landmarking, and object detection classes from the `@mediapipe/tasks-vision` library.
 */
class ProctorService {
  /**
   * The `faceDetector` property in the `ProctorService` class is used to store an instance of the
   * FaceDetector class from the `@mediapipe/tasks-vision` library. This instance is created during the
   * initialization of the `ProctorService` class and is used to detect faces in images or video
   * streams. The `faceDetector` property allows the `ProctorService` class to perform face detection
   * tasks using the functionalities provided by the FaceDetector class.
   */
  faceDetector?: FaceDetector

  /**
   * The `faceLandmarker?: FaceLandmarker` line in the `ProctorService` class is declaring a property
   * named `faceLandmarker` that can hold an instance of the `FaceLandmarker` class from the
   * `@mediapipe/tasks-vision` library.
   */
  faceLandmarker?: FaceLandmarker

  /**
   * The line `objectDetector?: ObjectDetector` in the `ProctorService` class is declaring a property
   * named `objectDetector` that can hold an instance of the `ObjectDetector` class from the
   * `@mediapipe/tasks-vision` library. This property is used to
   * store an instance of the `ObjectDetector` class, which is responsible for detecting objects in
   * images or video streams using the functionalities provided by the `ObjectDetector` class.
   */
  objectDetector?: ObjectDetector

  private eyeTracker: any
  private vision: any

  /**
   * The `ProctorService` class in TypeScript initializes and manages instances of face detection, face
   * landmarking, and object detection classes from the `@mediapipe/tasks-vision` library.
   */
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

  /**
   * Returns a singleton instance of the ProctorService class.
   * @returns {ProctorService} Proctor - The singleton instance of ProctorService.
   */
  static getInstance() {
    if (!ProctorService.instance) {
      ProctorService.instance = new ProctorService()
    }
    return ProctorService.instance
  }
}

export default ProctorService.getInstance
