import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ServiGoLogo } from "@/components/servigo-logo"

export default function Home() {
  const services = [
    {
      title: "Plomería",
      description: "Soluciones rápidas y confiables para problemas de fontanería.",
      icon: "🔧"
    },
    {
      title: "Electricidad",
      description: "Instalaciones y reparaciones eléctricas seguras.",
      icon: "💡"
    },
    {
      title: "Limpieza",
      description: "Servicios profesionales de limpieza para tu hogar u oficina.",
      icon: "🧹"
    },
    {
      title: "Mudanzas",
      description: "Traslados seguros y eficientes para tus pertenencias.",
      icon: "🚚"
    }
  ]

  const categories = [
    { name: "Hogar", count: 45 },
    { name: "Oficina", count: 32 },
    { name: "Construcción", count: 28 },
    { name: "Mantenimiento", count: 39 },
  ]

  const testimonials = [
    {
      name: "Ana Martínez",
      role: "Cliente satisfecha",
      content: "Excelente servicio, muy profesionales y puntuales. Resolvieron mi problema de plomería en minutos.",
      avatar: "👩"
    },
    {
      name: "Carlos López",
      role: "Cliente frecuente",
      content: "Siempre que necesito un servicio, acudo a ServiGo. Nunca me han fallado.",
      avatar: "👨"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="flex justify-center mb-6">
            <ServiGoLogo size="medium" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Encuentra el servicio que necesitas</h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Conectamos a los mejores profesionales con clientes que necesitan sus servicios de manera rápida y segura.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
              Buscar servicios
            </Button>
            <Button size="lg" variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
              Soy profesional
            </Button>
          </div>
        </div>
      </div>

      {/* Servicios destacados */}
      <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Servicios Populares</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="text-4xl mb-2">{service.icon}</div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="link" className="p-0 h-auto text-emerald-600">
                  Ver profesionales →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Categorías */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Explora por categoría</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <div key={index} className="p-6 border rounded-lg hover:shadow-md transition-shadow text-center">
                <h3 className="font-semibold text-lg">{category.name}</h3>
                <p className="text-slate-500">{category.count} servicios</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonios */}
      <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Lo que dicen nuestros clientes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">{testimonial.avatar}</div>
                <div>
                  <p className="italic text-slate-600 mb-4">"{testimonial.content}"</p>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-slate-500">{testimonial.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-emerald-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">¿Listo para encontrar el servicio perfecto?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Descubre profesionales calificados cerca de ti y resuelve lo que necesites hoy mismo.
          </p>
          <Button size="lg" className="bg-white text-emerald-600 hover:bg-slate-100">
            Comenzar ahora
          </Button>
        </div>
      </div>
    </div>
  )
}
