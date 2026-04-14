'use client'

import { useState, useEffect } from 'react'
import { LabResultsTable } from './LabResultsTable'
import { useSupabase } from '@/lib/supabase'

interface LabResultsPageProps {
  orderId: string
}

export function LabResultsPage({ orderId }: LabResultsPageProps) {
  const supabase = useSupabase()
  const [results, setResults] = useState<LabResult[]>([])
  const [referenceRanges, setReferenceRanges] = useState<{ [key: string]: { low: number; high: number } }>({})

  useEffect(() => {
    const fetchResults = async () => {
      const { data, error } = await supabase
        .from('lab_results')
        .select('*')
        .eq('order_id', orderId)

      if (error) {
        console.error(error)
        return
      }

      setResults(data)

      const ranges = await fetchReferenceRanges(supabase, data)
      setReferenceRanges(ranges)
    }

    fetchResults()
  }, [orderId, supabase])

  const fetchReferenceRanges = async (supabase: any, results: LabResult[]) => {
    const testIds = results.map((result) => result.test_id)
    const { data, error } = await supabase
      .from('lab_tests')
      .select('id, reference_range')
      .in('id', testIds)

    if (error) {
      console.error(error)
      return {}
    }

    const ranges: { [key: string]: { low: number; high: number } } = {}
    data.forEach((test) => {
      ranges[test.id] = test.reference_range
    })

    return ranges
  }

  return (
    <div>
      <h1>Lab Results</h1>
      {results.length > 0 && (
        <LabResultsTable results={results} referenceRanges={referenceRanges} />
      )}
    </div>
  )
}
Note: The above code is a basic implementation and might need to be adjusted according to your specific requirements. Additionally, you may need to add error handling and other features as per your application's needs.