import { describe, it, expect } from 'vitest'
import { createClient } from '@/lib/supabase/client'
import { DicomViewer } from '../components/DicomViewer'

describe('DICOM Viewer', () => {
  it('should render DICOM images', async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('dicom_images')
      .select('id, sopInstanceUid, seriesInstanceUid, studyInstanceUid, patientId, patientName, modality, image')

    if (error) {
      console.error(error)
    } else {
      const images = data as DicomImage[]
      const viewer = new DicomViewer()
      viewer.render(images)

      expect(viewer.renderedImages).toHaveLength(images.length)
    }
  })
})