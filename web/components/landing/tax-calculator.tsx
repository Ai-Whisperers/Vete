'use client'

import { useState } from 'react'
import { Calculator, TrendingDown, AlertTriangle } from 'lucide-react'

const countryRates: Record<string, { name: string; minRate: number; maxRate: number; label: string }> = {
  NL: { name: 'Netherlands', minRate: 37.07, maxRate: 49.50, label: '37-49.5%' },
  DE: { name: 'Germany', minRate: 14, maxRate: 47, label: '14-47%' },
  BE: { name: 'Belgium', minRate: 25, maxRate: 50, label: '25-50%' },
  ES: { name: 'Spain', minRate: 19, maxRate: 47, label: '19-47%' },
  AT: { name: 'Austria', minRate: 0, maxRate: 55, label: '0-55%' },
  OTHER: { name: 'Other', minRate: 25, maxRate: 45, label: '~25-45%' },
}

export function TaxCalculator() {
  const [country, setCountry] = useState('NL')
  const [income, setIncome] = useState('')
  const [investmentIncome, setInvestmentIncome] = useState('')
  const [isBusinessOwner, setIsBusinessOwner] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const calculate = () => {
    if (!income && !investmentIncome) return
    setShowResults(true)
  }

  const incomeNum = parseFloat(income) || 0
  const investmentNum = parseFloat(investmentIncome) || 0
  const totalIncome = incomeNum + investmentNum
  const rate = countryRates[country]
  const effectiveRate = (rate.minRate + rate.maxRate) / 2
  const businessMultiplier = isBusinessOwner ? 1.1 : 1
  const currentTaxEstimate = totalIncome * (effectiveRate / 100) * businessMultiplier

  const paraguayTaxOnLocal = 0
  const paraguayTaxEstimate = paraguayTaxOnLocal

  const annualSavings = currentTaxEstimate - paraguayTaxEstimate
  const fiveYearSavings = annualSavings * 5

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border-2 border-[#1B3A6B]/10 p-8 shadow-lg">
        <div className="flex items-center gap-3 mb-8">
          <Calculator className="h-8 w-8 text-[#C9A84C]" />
          <h2 className="text-2xl font-bold text-[#1B3A6B]" style={{ fontFamily: 'var(--font-playfair)' }}>
            Tax Savings Calculator
          </h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Your Country</label>
            <select
              value={country}
              onChange={(e) => { setCountry(e.target.value); setShowResults(false) }}
              className="w-full p-3 border-2 border-slate-200 rounded-xl text-slate-700 focus:border-[#1B3A6B] focus:outline-none transition-colors"
            >
              {Object.entries(countryRates).map(([key, val]) => (
                <option key={key} value={key}>{val.name} ({val.label})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Annual Employment/Freelance Income (EUR)</label>
            <input
              type="number"
              value={income}
              onChange={(e) => { setIncome(e.target.value); setShowResults(false) }}
              placeholder="e.g. 80000"
              className="w-full p-3 border-2 border-slate-200 rounded-xl text-slate-700 focus:border-[#1B3A6B] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Annual Investment/Capital Gains Income (EUR)</label>
            <input
              type="number"
              value={investmentIncome}
              onChange={(e) => { setInvestmentIncome(e.target.value); setShowResults(false) }}
              placeholder="e.g. 20000"
              className="w-full p-3 border-2 border-slate-200 rounded-xl text-slate-700 focus:border-[#1B3A6B] focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={isBusinessOwner}
              onClick={() => { setIsBusinessOwner(!isBusinessOwner); setShowResults(false) }}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${isBusinessOwner ? 'bg-[#C9A84C]' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isBusinessOwner ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className="text-sm font-semibold text-slate-700">I am a business owner</span>
          </div>

          <button
            onClick={calculate}
            className="w-full bg-[#1B3A6B] text-white font-bold py-4 rounded-xl hover:bg-[#0f2447] transition-colors"
          >
            Calculate Savings
          </button>
        </div>

        {showResults && totalIncome > 0 && (
          <div className="mt-8 space-y-4">
            <div className="h-px bg-slate-200" />

            <div className="grid gap-4">
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                <div className="text-sm text-slate-500 mb-1">Current estimated tax ({rate.name})</div>
                <div className="text-2xl font-bold text-slate-800">€{currentTaxEstimate.toLocaleString('en', { maximumFractionDigits: 0 })}<span className="text-sm font-normal text-slate-400">/year</span></div>
                <div className="text-xs text-slate-400 mt-1">Based on effective rate of ~{effectiveRate.toFixed(0)}%{isBusinessOwner ? ' + 10% social contributions' : ''}</div>
              </div>

              <div className="bg-green-50 rounded-xl p-5 border border-green-200">
                <div className="text-sm text-green-600 mb-1">Paraguay estimated tax (foreign income)</div>
                <div className="text-2xl font-bold text-green-700">€{paraguayTaxEstimate.toLocaleString('en', { maximumFractionDigits: 0 })}<span className="text-sm font-normal text-green-400">/year</span></div>
                <div className="text-xs text-green-500 mt-1">10% on Paraguayan-source income only. 0% on all foreign income.</div>
              </div>

              <div className="bg-[#1B3A6B] rounded-xl p-5">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingDown className="h-4 w-4 text-[#C9A84C]" />
                  <span className="text-sm text-slate-300">Estimated annual savings</span>
                </div>
                <div className="text-3xl font-bold text-[#C9A84C]">€{annualSavings.toLocaleString('en', { maximumFractionDigits: 0 })}<span className="text-sm font-normal text-slate-400">/year</span></div>
              </div>

              <div className="bg-[#1B3A6B]/5 rounded-xl p-5 border border-[#1B3A6B]/10">
                <div className="text-sm text-[#1B3A6B]/70 mb-1">Estimated 5-year savings</div>
                <div className="text-3xl font-bold text-[#1B3A6B]">€{fiveYearSavings.toLocaleString('en', { maximumFractionDigits: 0 })}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                This is an estimate for illustrative purposes only. Actual tax savings depend on your specific income structure, deductions, residency transition timing, and applicable bilateral tax treaties. Consult a qualified tax professional in both your home country and Paraguay before making any decisions.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
