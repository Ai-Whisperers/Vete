'use client'

import { useState } from 'react'
import { TrendingDown, ArrowRightLeft } from 'lucide-react'

const cityData: Record<string, {
  name: string
  rent: [number, number]
  groceries: number
  restaurant: number
  transport: number
  internet: number
  gym: number
}> = {
  amsterdam: { name: 'Amsterdam', rent: [1500, 2000], groceries: 350, restaurant: 20, transport: 90, internet: 40, gym: 45 },
  berlin: { name: 'Berlin', rent: [1000, 1400], groceries: 300, restaurant: 15, transport: 86, internet: 35, gym: 35 },
  brussels: { name: 'Brussels', rent: [1000, 1300], groceries: 300, restaurant: 18, transport: 55, internet: 40, gym: 40 },
  madrid: { name: 'Madrid', rent: [900, 1200], groceries: 250, restaurant: 14, transport: 55, internet: 35, gym: 40 },
  vienna: { name: 'Vienna', rent: [900, 1200], groceries: 300, restaurant: 15, transport: 55, internet: 30, gym: 35 },
  zurich: { name: 'Zurich', rent: [2000, 2500], groceries: 500, restaurant: 30, transport: 100, internet: 50, gym: 80 },
}

const asuncionData = {
  rent: [300, 500] as [number, number],
  groceries: 150,
  restaurant: 6,
  transport: 20,
  internet: 25,
  gym: 25,
}

function formatRange(range: [number, number]) {
  return `€${range[0]}-${range[1]}`
}

function midRange(range: [number, number]) {
  return (range[0] + range[1]) / 2
}

export function CostCalculator() {
  const [city, setCity] = useState('amsterdam')
  const data = cityData[city]

  const cityMonthly = midRange(data.rent) + data.groceries + data.restaurant * 15 + data.transport + data.internet + data.gym
  const asuncionMonthly = midRange(asuncionData.rent) + asuncionData.groceries + asuncionData.restaurant * 15 + asuncionData.transport + asuncionData.internet + asuncionData.gym
  const monthlySavings = cityMonthly - asuncionMonthly

  const rows: { label: string; city: string; asuncion: string }[] = [
    { label: 'Rent (1BR city center)', city: formatRange(data.rent), asuncion: formatRange(asuncionData.rent) },
    { label: 'Groceries (monthly)', city: `€${data.groceries}`, asuncion: `€${asuncionData.groceries}` },
    { label: 'Restaurant meal', city: `€${data.restaurant}`, asuncion: `€${asuncionData.restaurant}` },
    { label: 'Transportation (monthly)', city: `€${data.transport}`, asuncion: `€${asuncionData.transport}` },
    { label: 'Internet', city: `€${data.internet}`, asuncion: `€${asuncionData.internet}` },
    { label: 'Gym membership', city: `€${data.gym}`, asuncion: `€${asuncionData.gym}` },
    { label: 'Estimated monthly total', city: `€${cityMonthly.toLocaleString('en', { maximumFractionDigits: 0 })}`, asuncion: `€${asuncionMonthly.toLocaleString('en', { maximumFractionDigits: 0 })}` },
  ]

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl border-2 border-[#1B3A6B]/10 p-8 shadow-lg">
        <div className="flex items-center gap-3 mb-8">
          <ArrowRightLeft className="h-8 w-8 text-[#C9A84C]" />
          <h2 className="text-2xl font-bold text-[#1B3A6B]" style={{ fontFamily: 'var(--font-playfair)' }}>
            Cost of Living Calculator
          </h2>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Your current city</label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full p-3 border-2 border-slate-200 rounded-xl text-slate-700 focus:border-[#1B3A6B] focus:outline-none transition-colors"
          >
            {Object.entries(cityData).map(([key, val]) => (
              <option key={key} value={key}>{val.name}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#1B3A6B] text-white">
                <th className="p-4 text-left">Expense</th>
                <th className="p-4 text-right">{data.name}</th>
                <th className="p-4 text-right">Asunción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, i) => (
                <tr key={row.label} className={i === rows.length - 1 ? 'bg-[#1B3A6B]/5 font-semibold' : i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                  <td className={`p-4 text-sm ${i === rows.length - 1 ? 'font-bold text-[#1B3A6B]' : 'text-slate-700'}`}>{row.label}</td>
                  <td className={`p-4 text-sm text-right ${i === rows.length - 1 ? 'font-bold text-slate-700' : 'text-slate-600'}`}>{row.city}</td>
                  <td className={`p-4 text-sm text-right ${i === rows.length - 1 ? 'font-bold text-[#C9A84C]' : 'text-[#C9A84C]'}`}>{row.asuncion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-[#1B3A6B] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="h-5 w-5 text-[#C9A84C]" />
            <span className="text-sm text-slate-300">Estimated monthly savings in Asunción</span>
          </div>
          <div className="text-4xl font-bold text-[#C9A84C]">
            €{monthlySavings.toLocaleString('en', { maximumFractionDigits: 0 })}<span className="text-lg text-slate-400">/month</span>
          </div>
          <div className="text-sm text-slate-400 mt-2">
            That&apos;s €{(monthlySavings * 12).toLocaleString('en', { maximumFractionDigits: 0 })}/year or €{(monthlySavings * 60).toLocaleString('en', { maximumFractionDigits: 0 })} over 5 years — on living costs alone, before tax savings.
          </div>
        </div>

        <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-500">
            Cost estimates based on Numbeo and expat community data as of early 2025. Actual costs vary by neighborhood, lifestyle, and exchange rates. Asunción costs reflect a comfortable expat standard of living.
          </p>
        </div>
      </div>
    </div>
  )
}
