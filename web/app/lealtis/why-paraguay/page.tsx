import Link from 'next/link'
import { lealtisConfig } from '../config'

export default function WhyParaguayPage() {
  const { whyParaguay } = lealtisConfig
  
  return (
    <div className="flex flex-col">
      <section className="bg-[#1B3A6B] py-16 text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-heading text-4xl font-bold">Why Paraguay?</h1>
            <p className="mt-2 text-xl text-gray-200">
              Discover why Europeans are choosing Paraguay for a better quality of life and smart investment opportunities.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {whyParaguay.map((item, i) => (
              <div key={i} className="rounded-lg border border-[#E5E5E5] p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#1B3A6B]">
                  <span className="text-xl font-bold text-white">{i + 1}</span>
                </div>
                <h2 className="font-heading text-xl font-bold text-[#1B3A6B]">{item.title}</h2>
                <p className="mt-2 text-[#4A4A4A]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F8F7F5] py-16">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="mb-8 text-center font-heading text-3xl font-bold text-[#1B3A6B]">The Opportunity</h2>
          
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="font-heading text-lg font-bold text-[#1B3A6B]">A Growing Economy</h3>
              <p className="mt-2 text-[#4A4A4A]">
                Paraguay's economy has grown steadily over the past decade with GDP growth consistently above 4%. 
                The country offers significant opportunities in agriculture, real estate, and emerging tech sectors.
              </p>
            </div>
            
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="font-heading text-lg font-bold text-[#1B3A6B]">Real Estate Affordability</h3>
              <p className="mt-2 text-[#4A4A4A]">
                Property prices in Asunción are a fraction of European levels. A modern apartment downtown costs $1,500-2,500/m² 
                versus $5,000+ in major European cities. Rental yields of 6-8% are common.
              </p>
            </div>
            
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="font-heading text-lg font-bold text-[#1B3A6B]">Quality of Life</h3>
              <p className="mt-2 text-[#4A4A4A]">
                Clean air, good food, friendly people, and modern infrastructure. Asunción offers international schools, 
                good hospitals, and shopping centers — all at reasonable prices.
              </p>
            </div>
            
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="font-heading text-lg font-bold text-[#1B3A6B]">Ease of Residency</h3>
              <p className="mt-2 text-[#4A4A4A]">
                Paraguay offers one of the most straightforward residency processes in the Americas. 
                Permanent residency can lead to citizenship after 3 years, with a passport allowing travel without visa to the Schengen Area.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 text-center md:px-6">
          <h2 className="font-heading text-2xl font-bold text-[#1B3A6B]">Ready to explore Paraguay?</h2>
          <p className="mt-2 text-[#4A4A4A]">Let's discuss how we can help you make the move.</p>
          <Link
            href="/lealtis/contact"
            className="mt-6 inline-block rounded-full bg-[#1B3A6B] px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-[#2C4F7D]"
          >
            Schedule Consultation
          </Link>
        </div>
      </section>
    </div>
  )
}