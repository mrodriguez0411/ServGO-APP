import { ServiGoLogo } from "./servigo-logo"

export function LogoShowcase() {
  return (
    <div className="space-y-12">
      {/* Logo Principal */}
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <h2 className="text-2xl font-semibold text-slate-700 mb-8">Logo Principal</h2>
        <ServiGoLogo size="large" />
      </div>

      {/* Variaciones */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h3 className="text-xl font-semibold text-slate-700 mb-6">Versión Mediana</h3>
          <ServiGoLogo size="medium" />
        </div>

        <div className="bg-slate-800 rounded-2xl shadow-lg p-8 text-center">
          <h3 className="text-xl font-semibold text-white mb-6">Versión Oscura</h3>
          <ServiGoLogo size="medium" variant="dark" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl shadow-lg p-8 text-center">
        <h3 className="text-xl font-semibold text-white mb-6">Sobre Fondo Original</h3>
        <ServiGoLogo size="medium" variant="dark" />
      </div>

      {/* Versión Compacta */}
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <h3 className="text-xl font-semibold text-slate-700 mb-6">Versión Compacta (App Icon)</h3>
        <div className="flex justify-center space-x-8">
          <ServiGoLogo size="small" />
          <ServiGoLogo size="small" variant="dark" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h3 className="text-xl font-semibold text-slate-700 mb-6 text-center">Paleta de Colores Original</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-20 h-20 bg-emerald-500 rounded-lg mx-auto mb-2"></div>
            <p className="text-sm font-medium text-slate-600">Verde Principal</p>
            <p className="text-xs text-slate-500">#10B981</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-500 rounded-lg mx-auto mb-2"></div>
            <p className="text-sm font-medium text-slate-600">Azul Secundario</p>
            <p className="text-xs text-slate-500">#3B82F6</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-amber-500 rounded-lg mx-auto mb-2"></div>
            <p className="text-sm font-medium text-slate-600">Amarillo Acento</p>
            <p className="text-xs text-slate-500">#F59E0B</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-slate-700 rounded-lg mx-auto mb-2"></div>
            <p className="text-sm font-medium text-slate-600">Gris Texto</p>
            <p className="text-xs text-slate-500">#374151</p>
          </div>
        </div>
      </div>
    </div>
  )
}
