import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { AdoptionService } from '@/lib/domain/adoption/service'
import { CreateAdoptionApplicationData } from '@/lib/domain/adoption/types'

export function ApplicationForm() {
  const t = useTranslations('adoption')
  const [formData, setFormData] = useState<CreateAdoptionApplicationData>({
    petId: '',
    applicantName: '',
    applicantEmail: '',
    applicantPhone: '',
  })

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      const service = new AdoptionService(createClient())
      const result = await service.createApplication(formData, 'system', 'tenant-id')
      console.log(result)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        {t('applicantName')}
        <input type="text" value={formData.applicantName} onChange={(event) => setFormData({ ...formData, applicantName: event.target.value })} />
      </label>
      <label>
        {t('applicantEmail')}
        <input type="email" value={formData.applicantEmail} onChange={(event) => setFormData({ ...formData, applicantEmail: event.target.value })} />
      </label>
      <label>
        {t('applicantPhone')}
        <input type="tel" value={formData.applicantPhone} onChange={(event) => setFormData({ ...formData, applicantPhone: event.target.value })} />
      </label>
      <button type="submit">{t('submit')}</button>
    </form>
  )
}
This implementation provides a basic structure for the adoption application feature. It includes the domain layer with types, repository, and service, as well as server actions and a component for the application form. The `AdoptionService` class handles the business logic for creating an adoption application, and the `ApplicationForm` component allows users to submit their applications.