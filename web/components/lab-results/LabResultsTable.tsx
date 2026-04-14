'use client'

import { useState, useEffect } from 'react'
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table'
import { formatCurrency, formatCurrencyShort } from '@/lib/format'
import { labResultsSchema } from '@/lib/schemas/lab'
import type { LabResult } from '@/lib/schemas/lab'

interface LabResultsTableProps {
  results: LabResult[]
  referenceRanges: { [key: string]: { low: number; high: number } }
}

export function LabResultsTable({ results, referenceRanges }: LabResultsTableProps) {
  const [highlightedResults, setHighlightedResults] = useState<LabResult[]>([])

  useEffect(() => {
    const highlighted = results.filter((result) => {
      const range = referenceRanges[result.test_id]
      if (!range) return false
      return result.numeric_value < range.low || result.numeric_value > range.high
    })
    setHighlightedResults(highlighted)
  }, [results, referenceRanges])

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableCell>Test</TableCell>
          <TableCell>Result</TableCell>
          <TableCell>Reference Range</TableCell>
          <TableCell>Flag</TableCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {results.map((result) => (
          <TableRow key={result.test_id}>
            <TableCell>{result.test_id}</TableCell>
            <TableCell>
              {result.numeric_value ? (
                <span>
                  {result.numeric_value} {result.unit}
                </span>
              ) : (
                <span>{result.value}</span>
              )}
            </TableCell>
            <TableCell>
              {referenceRanges[result.test_id] && (
                <span>
                  {referenceRanges[result.test_id].low} - {referenceRanges[result.test_id].high}
                </span>
              )}
            </TableCell>
            <TableCell>
              {highlightedResults.includes(result) && (
                <span style={{ color: 'red' }}>{result.flag}</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}