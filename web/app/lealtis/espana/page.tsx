import { Metadata } from 'next'
import Link from 'next/link'
import { LandingNav, LandingFooter, CookieConsent, FloatingWhatsApp } from '@/components/landing'
import { ArrowRight, CheckCircle2, AlertTriangle, FileText, Clock, Scale } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Residencia en Paraguay para Emprendedores Españoles | Convenio Doble Imposición',
  description: 'Guía completa sobre el convenio de doble imposición España-Paraguay, la cuarentena fiscal y el proceso de establecimiento para españoles. LEALTIS te ayuda paso a paso.',
  keywords: ['residencia Paraguay españoles', 'convenio doble imposición España Paraguay', 'cuarentena fiscal España', 'modelo 030', 'residencia fiscal Paraguay', 'NHR alternativa Paraguay', 'impuestos españoles exterior', 'tributación territorial Paraguay'],
  alternates: {
    canonical: '/espana',
  },
}

export default function EspanaPage() {
  return (
    <>
      <LandingNav />
      <main className="min-h-screen pt-28 bg-white">
        <div className="container mx-auto px-4 md:px-6 py-20">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1B3A6B] mb-6" style={{ fontFamily: 'var(--font-playfair)' }}>
              Residencia en Paraguay para Emprendedores Españoles
            </h1>
            <p className="text-xl text-slate-600">
              Guía completa sobre el convenio de doble imposición España-Paraguay, la cuarentena fiscal y el proceso de establecimiento
            </p>
          </div>

          {/* Why Paraguay for Spaniards */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="flex items-center gap-3 mb-8">
              <CheckCircle2 className="h-6 w-6 text-[#C9A84C]" />
              <h2 className="text-2xl font-bold text-[#1B3A6B]" style={{ fontFamily: 'var(--font-playfair)' }}>
                ¿Por qué Paraguay para españoles ahora?
              </h2>
            </div>
            <div className="space-y-6">
              <p className="text-slate-700 leading-relaxed">
                La eliminación del Régimen Fiscal de los Residentes No Habituales (NHR) en Portugal en 2024 dejó a miles de emprendedores españoles sin su principal alternativa fiscal. El NHR permitía una tributación reducida durante 10 años, pero su desaparición obliga a buscar nuevas opciones. Paraguay ha emergido como la alternativa más seria para los emprendedores españoles por varias razones concretas.
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <div className="text-3xl font-bold text-[#C9A84C] mb-2">2024</div>
                  <h3 className="font-bold text-[#1B3A6B] mb-2">Convenio Doble Imposición firmado</h3>
                  <p className="text-sm text-slate-600">España y Paraguay firmaron el Convenio para evitar la Doble Imposición (CDI), que proporciona seguridad jurídica a los residentes españoles en Paraguay y viceversa.</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <div className="text-3xl font-bold text-[#C9A84C] mb-2">0%</div>
                  <h3 className="font-bold text-[#1B3A6B] mb-2">Impuesto sobre renta extranjera</h3>
                  <p className="text-sm text-slate-600">El sistema territorial paraguayo no grava ingresos de fuente extranjera: trabajo remoto, dividendos del exterior, ganancias de capital internacionales — todo libre de impuestos.</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <div className="text-3xl font-bold text-[#C9A84C] mb-2">∞</div>
                  <h3 className="font-bold text-[#1B3A6B] mb-2">Sin límite temporal</h3>
                  <p className="text-sm text-slate-600">A diferencia del NHR portugués (10 años) o el IFICI (10 años), los beneficios del sistema territorial paraguayo no tienen fecha de caducidad.</p>
                </div>
              </div>
              <p className="text-slate-700 leading-relaxed">
                El tipo impositivo máximo en España para renta general alcanza el 47% (más el impuesto sobre el patrimonio en varias comunidades autónomas). Para un autónomo con ingresos de 100.000€ anuales, la diferencia entre tributar en España vs. Paraguay puede superar los 35.000€ al año. En cinco años, son más de 175.000€ en ahorro fiscal.
              </p>
            </div>
          </div>

          {/* Double Taxation Treaty */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="flex items-center gap-3 mb-8">
              <FileText className="h-6 w-6 text-[#C9A84C]" />
              <h2 className="text-2xl font-bold text-[#1B3A6B]" style={{ fontFamily: 'var(--font-playfair)' }}>
                El Convenio de Doble Imposición España-Paraguay
              </h2>
            </div>
            <div className="space-y-6">
              <p className="text-slate-700 leading-relaxed">
                El CDI firmado entre España y Paraguay establece las reglas para determinar qué país tiene derecho a gravar los distintos tipos de renta. Este convenio es fundamental porque elimina la posibilidad de ser gravado dos veces por los mismos ingresos.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#1B3A6B] text-white">
                      <th className="p-4 text-left">Tipo de Renta</th>
                      <th className="p-4 text-left">¿Quién grava?</th>
                      <th className="p-4 text-left">Notas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-4 font-semibold text-[#1B3A6B]">Renta del trabajo (empleo)</td>
                      <td className="p-4 text-slate-600">Estado de residencia (Paraguay)</td>
                      <td className="p-4 text-slate-600">Si trabajas remotamente para empresas españolas estando en Paraguay, tributas solo en Paraguay</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="p-4 font-semibold text-[#1B3A6B]">Dividendos</td>
                      <td className="p-4 text-slate-600">Ambos, con límite (15% retención máxima en origen)</td>
                      <td className="p-4 text-slate-600">España retiene, Paraguay exonera por ser renta extranjera</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-[#1B3A6B]">Ganancias de capital</td>
                      <td className="p-4 text-slate-600">Estado de residencia</td>
                      <td className="p-4 text-slate-600">Venta de acciones, criptomonedas, inmuebles fuera de Paraguay: 0% en Paraguay</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="p-4 font-semibold text-[#1B3A6B]">Renta de inmuebles</td>
                      <td className="p-4 text-slate-600">Estado donde está el inmueble</td>
                      <td className="p-4 text-slate-600">Un piso en Madrid sigue tributando en España</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-[#1B3A6B]">Pensiones</td>
                      <td className="p-4 text-slate-600">Estado de residencia (generalmente)</td>
                      <td className="p-4 text-slate-600">Las pensiones españolas pueden tributar en España según el tipo</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-[#C9A84C]/10 rounded-lg border border-[#C9A84C]/20">
                <p className="text-sm text-[#1B3A6B]"><strong>Nota importante:</strong> El CDI no te permite evitar tributar por rentas inmobiliarias situadas en España. Si mantienes propiedades en España, seguirás tributando por ellas en la Agencia Tributaria.</p>
              </div>
            </div>
          </div>

          {/* Cuarentena Fiscal */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="flex items-center gap-3 mb-8">
              <AlertTriangle className="h-6 w-6 text-[#C9A84C]" />
              <h2 className="text-2xl font-bold text-[#1B3A6B]" style={{ fontFamily: 'var(--font-playfair)' }}>
                La Cuarentena Fiscal explicada
              </h2>
            </div>
            <div className="space-y-6">
              <p className="text-slate-700 leading-relaxed">
                La &quot;cuarentena fiscal&quot; es el concepto que describe el período durante el cual España sigue considerándote residente fiscal a pesar de que te hayas trasladado a Paraguay. Es el aspecto más importante que debes entender antes de tomar cualquier decisión.
              </p>
              <div className="bg-red-50 rounded-xl p-6 border border-red-100">
                <h3 className="font-bold text-red-800 mb-2">¿Qué es la cuarentena fiscal?</h3>
                <p className="text-red-700 text-sm mb-3">
                  España aplica el criterio de residencia fiscal basado en el &quot;centro de intereses vitales&quot;. No basta con estar menos de 183 días en España — la Agencia Tributaria puede considerar que sigues siendo residente fiscal si:
                </p>
                <ul className="space-y-2 text-sm text-red-700">
                  <li className="flex gap-2"><span className="text-[#C9A84C] font-bold">1.</span> Tu cónyuge o hijos menores residen en España</li>
                  <li className="flex gap-2"><span className="text-[#C9A84C] font-bold">2.</span> Tu actividad económica principal sigue vinculada a España</li>
                  <li className="flex gap-2"><span className="text-[#C9A84C] font-bold">3.</span> Mantienes tu vivienda principal en España</li>
                  <li className="flex gap-2"><span className="text-[#C9A84C] font-bold">4.</span> Tu centro de intereses económicos sigue siendo España</li>
                </ul>
              </div>
              <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                <h3 className="font-bold text-green-800 mb-2">Cómo gestionar la cuarentena correctamente</h3>
                <ul className="space-y-3 text-sm text-green-700">
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-700 shrink-0" />
                    <span><strong>Traslada tu vida real:</strong> No basta con alquilar un piso en Asunción. Debes demostrar que tu vida cotidiana está en Paraguay — contratos de alquiler a tu nombre, facturas de servicios, matrícula escolar de hijos, etc.</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-700 shrink-0" />
                    <span><strong>Presenta el Modelo 030:</strong> Comunica tu cambio de residencia fiscal a la Agencia Tributaria antes de marcharte.</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-700 shrink-0" />
                    <span><strong>Espera al menos un año completo:</strong> La transición fiscal realista dura 12-24 meses. El primer año puedes tener obligaciones en ambos países.</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-700 shrink-0" />
                    <span><strong>Cierra contratos y servicios en España:</strong> Dar de baja el padrón municipal, cerrar contratos de telefonía, seguros, gimnasio — todo cuenta como evidencia de abandono de residencia.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Modelo 030 */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="flex items-center gap-3 mb-8">
              <FileText className="h-6 w-6 text-[#C9A84C]" />
              <h2 className="text-2xl font-bold text-[#1B3A6B]" style={{ fontFamily: 'var(--font-playfair)' }}>
                Modelo 030 y salida de la residencia fiscal española
              </h2>
            </div>
            <div className="space-y-6">
              <p className="text-slate-700 leading-relaxed">
                El Modelo 030 es la declaración censal que todo contribuyente debe presentar para comunicar cambios en su situación tributaria, incluyendo el cambio de residencia fiscal al extranjero. Presentarlo correctamente es el primer paso formal de tu salida del sistema fiscal español.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <h3 className="font-bold text-[#1B3A6B] mb-4">Pasos para presentar el Modelo 030</h3>
                  <ol className="space-y-3 text-sm text-slate-700">
                    <li className="flex gap-3">
                      <span className="text-[#C9A84C] font-bold shrink-0">1.</span>
                      <span>Accede a la sede electrónica de la AEAT (Agencia Tributaria) con certificado digital o Cl@ve</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[#C9A84C] font-bold shrink-0">2.</span>
                      <span>Selecciona &quot;Declaración censal de modificación&quot; y marca &quot;Baja por cambio de residencia al extranjero&quot;</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[#C9A84C] font-bold shrink-0">3.</span>
                      <span>Indica la fecha efectiva del cambio de residencia y el nuevo país (Paraguay)</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[#C9A84C] font-bold shrink-0">4.</span>
                      <span>Presenta el certificado de residencia fiscal paraguayo emitido por la SET (Subsecretaría de Estado de Tributación)</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[#C9A84C] font-bold shrink-0">5.</span>
                      <span>Presenta ante la AEAT el certificado del CDI si corresponde</span>
                    </li>
                  </ol>
                </div>
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <h3 className="font-bold text-[#1B3A6B] mb-4">Documentación necesaria</h3>
                  <ul className="space-y-3 text-sm text-slate-700">
                    <li className="flex gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#C9A84C] shrink-0 mt-0.5" />
                      <span>Certificado de residencia fiscal de Paraguay (SET)</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#C9A84C] shrink-0 mt-0.5" />
                      <span>Contrato de alquiler o escritura de propiedad en Paraguay</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#C9A84C] shrink-0 mt-0.5" />
                      <span>Carnet de residencia paraguayo (cédula de identidad)</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#C9A84C] shrink-0 mt-0.5" />
                      <span> certificado de empadronamiento cancelado en España</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#C9A84C] shrink-0 mt-0.5" />
                      <span>Justificantes de baja en servicios en España</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800"><strong>Atención:</strong> La presentación del Modelo 030 no exime de presentar la última declaración de la renta en España (IRPF) por el año en que te vas. Debes declarar como residente fiscal el período que viviste en España ese año.</p>
              </div>
            </div>
          </div>

          {/* 183-day rule */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="flex items-center gap-3 mb-8">
              <Clock className="h-6 w-6 text-[#C9A84C]" />
              <h2 className="text-2xl font-bold text-[#1B3A6B]" style={{ fontFamily: 'var(--font-playfair)' }}>
                La regla de los 183 días y el establecimiento de residencia fiscal
              </h2>
            </div>
            <div className="space-y-6">
              <p className="text-slate-700 leading-relaxed">
                Tanto España como Paraguay utilizan el criterio de los 183 días para determinar la residencia fiscal. Sin embargo, la interacción entre ambos sistemas requiere planificación cuidadosa.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#1B3A6B] text-white">
                      <th className="p-4 text-left">Criterio</th>
                      <th className="p-4 text-left">España</th>
                      <th className="p-4 text-left">Paraguay</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-4 font-semibold text-[#1B3A6B]">Permanencia</td>
                      <td className="p-4 text-slate-600">&gt;183 días/año = residente</td>
                      <td className="p-4 text-slate-600">&gt;183 días/año = residente</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="p-4 font-semibold text-[#1B3A6B]">Centro de intereses</td>
                      <td className="p-4 text-slate-600">Vínculos económicos y familiares</td>
                      <td className="p-4 text-slate-600">Actividad económica principal</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-[#1B3A6B]">Cónyuge/hijos</td>
                      <td className="p-4 text-slate-600">Presunción de residencia si familia en España</td>
                      <td className="p-4 text-slate-600">No presunción automática</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="p-4 font-semibold text-[#1B3A6B]">Certificado de residencia</td>
                      <td className="p-4 text-slate-600">AEAT emite certificado</td>
                      <td className="p-4 text-slate-600">SET emite certificado</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <h3 className="font-bold text-[#1B3A6B] mb-3">Planificación recomendada para españoles</h3>
                <ol className="space-y-3 text-sm text-slate-700">
                  <li className="flex gap-3">
                    <span className="text-[#C9A84C] font-bold shrink-0">1.</span>
                    <span><strong>Mes 1-2:</strong> Inicia el trámite de residencia en Paraguay. Abre cuenta bancaria, firma contrato de alquiler.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#C9A84C] font-bold shrink-0">2.</span>
                    <span><strong>Mes 3-4:</strong> Recibe tu residencia paraguaya. Traslada tu vida cotidiana — préstamos de libros, matrícula de colegio para hijos, etc.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#C9A84C] font-bold shrink-0">3.</span>
                    <span><strong>Mes 5-6:</strong> Presenta el Modelo 030 en España. Cierra servicios y baja del padrón municipal.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#C9A84C] font-bold shrink-0">4.</span>
                    <span><strong>Mes 7-12:</strong> Establece residencia fiscal en Paraguay. Solicita certificado de la SET. Asegúrate de pasar más de 183 días fuera de España.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#C9A84C] font-bold shrink-0">5.</span>
                    <span><strong>Año 2:</strong> Primer año fiscal completo como no residente en España. Presenta la declaración del IRPF del último año parcial.</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3 mb-3">
                <Scale className="h-5 w-5 text-slate-600" />
                <h3 className="font-bold text-slate-800">Aviso legal</h3>
              </div>
              <p className="text-sm text-slate-600">
                Esta guía tiene fines informativos únicamente y no constituye asesoramiento fiscal o legal. La normativa fiscal española es compleja y las circunstancias individuales varían significativamente. LEALTIS recomienda encarecidamente consultar con un asesor fiscal colegiado en España antes de tomar cualquier decisión sobre cambio de residencia fiscal. La evasión fiscal es ilegal; la optimización fiscal dentro de la ley es tu derecho.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="max-w-2xl mx-auto p-12 bg-[#1B3A6B] rounded-2xl text-center">
            <h2 className="text-3xl font-bold text-white mb-4">¿Listo para explorar tu opción con Paraguay?</h2>
            <p className="text-slate-300 mb-8">Reserva una consulta gratuita con nuestro equipo. Entendemos las necesidades específicas de los emprendedores españoles.</p>
            <Link href="/lealtis/contacto" className="inline-flex items-center gap-2 rounded-full bg-[#C9A84C] px-8 py-4 font-bold text-white shadow-lg hover:bg-[#a67c2e] transition-all">
              Reservar Consulta Gratuita
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </main>
      <LandingFooter />
      <FloatingWhatsApp />
      <CookieConsent />
    </>
  )
}
