'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface DicomUploadProps {
  onUpload: (image: DicomImage) => void
}

const DicomUpload = ({ onUpload }: DicomUploadProps) => {
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setFile(file)
  }

  const handleUpload = async () => {
    if (!file) return

    const supabase = createClient()
    const { data, error } = await supabase.storage
      .from('dicom-images')
      .upload(file, {
        cacheControl: 'public, max-age=31536000',
      })

    if (error) {
      console.error(error)
    } else {
      const image: DicomImage = {
        id: data.id,
        sopInstanceUid: data.sopInstanceUid,
        seriesInstanceUid: data.seriesInstanceUid,
        studyInstanceUid: data.studyInstanceUid,
        patientId: data.patientId,
        patientName: data.patientName,
        modality: data.modality,
        image: data.image,
      }

      onUpload(image)
    }
  }

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  )
}

export default DicomUpload