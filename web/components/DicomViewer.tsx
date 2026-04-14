'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  CheckCircle,
  ArrowDown,
  ArrowUp,
  ArrowDownToLine,
  ArrowUpToLine,
  Minus,
  TrendingUp,
  TrendingDown,
  Loader2,
  FileText,
  Download,
  AlertTriangle,
  Clock,
} from 'lucide-react'
import { DicomViewer as Dicom } from 'react-dicom-viewer'

interface DicomImage {
  id: string
  sopInstanceUid: string
  seriesInstanceUid: string
  studyInstanceUid: string
  patientId: string
  patientName: string
  modality: string
  image: Blob
}

const DicomViewer = () => {
  const [dicomImages, setDicomImages] = useState<DicomImage[]>([])
  const [selectedImage, setSelectedImage] = useState<DicomImage | null>(null)

  useEffect(() => {
    const fetchDicomImages = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('dicom_images')
        .select('id, sopInstanceUid, seriesInstanceUid, studyInstanceUid, patientId, patientName, modality, image')

      if (error) {
        console.error(error)
      } else {
        setDicomImages(data)
      }
    }

    fetchDicomImages()
  }, [])

  const handleImageSelect = (image: DicomImage) => {
    setSelectedImage(image)
  }

  return (
    <div>
      <h1>DICOM Viewer</h1>
      <div>
        {dicomImages.map((image) => (
          <div key={image.id}>
            <button onClick={() => handleImageSelect(image)}>
              {image.patientName} - {image.modality}
            </button>
          </div>
        ))}
      </div>
      {selectedImage && (
        <Dicom
          image={selectedImage.image}
          sopInstanceUid={selectedImage.sopInstanceUid}
          seriesInstanceUid={selectedImage.seriesInstanceUid}
          studyInstanceUid={selectedImage.studyInstanceUid}
        />
      )}
    </div>
  )
}

export default DicomViewer