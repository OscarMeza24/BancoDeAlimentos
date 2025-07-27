import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Heart,
  Users,
  HandHeart,
  MapPin,
  BarChart3,
  Shield,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="mx-auto mb-6 h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
              <Heart className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-5xl font-bold text-green-800 mb-4">
              Banco de Alimentos Virtual
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Conectamos la generosidad con la necesidad. Únete a nuestra
              comunidad para reducir el desperdicio de alimentos y ayudar a
              quienes más lo necesitan.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              <Link href="/auth">Comenzar Ahora</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#como-funciona">Conoce Más</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-green-600">1,300M</div>
              <div className="text-gray-600">
                Toneladas de comida desperdiciadas anualmente
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-600">828M</div>
              <div className="text-gray-600">
                Personas sufren hambre en el mundo
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-purple-600">30%</div>
              <div className="text-gray-600">
                De los alimentos se desperdician
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-orange-600">100%</div>
              <div className="text-gray-600">Comprometidos con el cambio</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="como-funciona" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              ¿Cómo Funciona?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Nuestro proceso es simple y efectivo para conectar donantes con
              beneficiarios
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Heart className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-green-800">1. Dona</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Registra los alimentos que quieres donar. Especifica cantidad,
                  fecha de vencimiento y ubicación para recolección.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-blue-800">2. Conecta</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Nuestra plataforma conecta automáticamente donantes con
                  beneficiarios cercanos que necesitan esos alimentos.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <HandHeart className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-purple-800">3. Impacta</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Los voluntarios coordinan la entrega y seguimos el impacto de
                  cada donación para maximizar el beneficio social.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Características Principales
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Herramientas diseñadas para facilitar la donación y maximizar el
              impacto social
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <MapPin className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle>Geolocalización</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Encuentra donantes y beneficiarios cerca de ti. Optimiza las
                  rutas de entrega y reduce costos logísticos.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Reportes Transparentes</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Seguimiento completo de donaciones, impacto social y
                  estadísticas en tiempo real para máxima transparencia.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>Seguridad Garantizada</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Verificación de usuarios, pagos seguros y protección de datos
                  personales con los más altos estándares.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-orange-600 mb-2" />
                <CardTitle>Comunidad Activa</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Red de voluntarios comprometidos que facilitan la logística y
                  amplían el alcance de las donaciones.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Heart className="h-8 w-8 text-red-600 mb-2" />
                <CardTitle>Donaciones Monetarias</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Además de alimentos, permite donaciones monetarias para
                  campañas específicas y necesidades urgentes.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <HandHeart className="h-8 w-8 text-teal-600 mb-2" />
                <CardTitle>Eventos Solidarios</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Organiza y participa en eventos comunitarios, campañas
                  especiales y actividades de voluntariado.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-green-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Únete a Nuestra Misión</h2>
          <p className="text-xl mb-8 opacity-90">
            Cada donación cuenta. Cada gesto importa. Juntos podemos crear un
            mundo sin hambre y sin desperdicio de alimentos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/auth">Registrarse Gratis</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-green-600 bg-transparent"
            >
              <Link href="/contacto">Contactar</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="h-6 w-6 text-green-400" />
                <span className="font-bold text-lg">Banco de Alimentos</span>
              </div>
              <p className="text-gray-400">
                Conectando generosidad con necesidad para un mundo mejor.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Plataforma</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/como-funciona" className="hover:text-white">
                    Cómo Funciona
                  </Link>
                </li>
                <li>
                  <Link href="/seguridad" className="hover:text-white">
                    Seguridad
                  </Link>
                </li>
                <li>
                  <Link href="/precios" className="hover:text-white">
                    Precios
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Comunidad</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/voluntarios" className="hover:text-white">
                    Voluntarios
                  </Link>
                </li>
                <li>
                  <Link href="/organizaciones" className="hover:text-white">
                    Organizaciones
                  </Link>
                </li>
                <li>
                  <Link href="/eventos" className="hover:text-white">
                    Eventos
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Soporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/ayuda" className="hover:text-white">
                    Centro de Ayuda
                  </Link>
                </li>
                <li>
                  <Link href="/contacto" className="hover:text-white">
                    Contacto
                  </Link>
                </li>
                <li>
                  <Link href="/privacidad" className="hover:text-white">
                    Privacidad
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>
              &copy; 2024 Banco de Alimentos Virtual. Todos los derechos
              reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
