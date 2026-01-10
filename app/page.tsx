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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50">
      {/* Hero Section */}
      <section className="relative py-24 px-4 text-center overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-secondary/10 to-primary/10 rounded-full blur-3xl -z-10"></div>
        
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 animate-slide-in-up">
            <div className="mx-auto mb-8 h-24 w-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-glow animate-float">
              <Heart className="h-12 w-12 text-white animate-pulse" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gradient mb-6 leading-tight">
              Banco de Alimentos Virtual
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto font-light leading-relaxed">
              Conectamos la generosidad con la necesidad. Únete a nuestra comunidad para reducir el desperdicio de alimentos y ayudar a quienes más lo necesitan.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white font-semibold shadow-md hover:shadow-glow transition-all duration-300"
            >
              <Link href="/auth">Comenzar Ahora</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-2 border-primary text-primary hover:bg-primary/5 font-semibold">
              <Link href="#como-funciona">Conoce Más</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-primary/5 via-secondary/5 to-primary/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 hover:shadow-elevated transition-all duration-300 animate-slide-in-up">
              <div className="text-4xl md:text-5xl font-bold text-gradient mb-3">1,300M</div>
              <div className="text-gray-700 font-medium">
                Toneladas de comida desperdiciadas anualmente
              </div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-secondary/5 to-secondary/10 hover:shadow-elevated transition-all duration-300 animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="text-4xl md:text-5xl font-bold text-transparent bg-gradient-to-r from-secondary to-orange-500 bg-clip-text mb-3">828M</div>
              <div className="text-gray-700 font-medium">
                Personas sufren hambre en el mundo
              </div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-500/5 to-blue-500/10 hover:shadow-elevated transition-all duration-300 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-3">30%</div>
              <div className="text-gray-700 font-medium">
                De los alimentos se desperdician
              </div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-500/5 to-green-500/10 hover:shadow-elevated transition-all duration-300 animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="text-4xl md:text-5xl font-bold text-green-600 mb-3">100%</div>
              <div className="text-gray-700 font-medium">Comprometidos con el cambio</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="como-funciona" className="py-24 px-4 bg-gradient-to-b from-secondary/8 to-primary/8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              ¿Cómo Funciona?
            </h2>
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-200 max-w-3xl mx-auto">
              Nuestro proceso es simple y efectivo para conectar donantes con beneficiarios en tu comunidad
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center card-hover">
              <CardHeader>
                <div className="mx-auto mb-6 h-20 w-20 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center shadow-elevated">
                  <Heart className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl">1. Dona</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Registra los alimentos que quieres donar. Especifica cantidad, fecha de vencimiento y ubicación para recolección.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center card-hover">
              <CardHeader>
                <div className="mx-auto mb-6 h-20 w-20 bg-gradient-to-br from-secondary to-secondary/60 rounded-full flex items-center justify-center shadow-elevated">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl">2. Conecta</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Nuestra plataforma conecta automáticamente donantes con beneficiarios cercanos que necesitan esos alimentos.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center card-hover">
              <CardHeader>
                <div className="mx-auto mb-6 h-20 w-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-elevated">
                  <HandHeart className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl">3. Impacta</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Los voluntarios coordinan la entrega y seguimos el impacto de cada donación para maximizar el beneficio social.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-primary/8 via-secondary/5 to-primary/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Características Principales
            </h2>
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-200 max-w-3xl mx-auto">
              Herramientas diseñadas para facilitar la donación y maximizar el impacto social
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="card-hover border-l-4 border-l-primary">
              <CardHeader>
                <MapPin className="h-10 w-10 text-primary mb-3" />
                <CardTitle className="text-xl">Geolocalización</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Encuentra donantes y beneficiarios cerca de ti. Optimiza las rutas de entrega y reduce costos logísticos.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-hover border-l-4 border-l-secondary">
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-secondary mb-3" />
                <CardTitle className="text-xl">Reportes Transparentes</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Seguimiento completo de donaciones, impacto social y estadísticas en tiempo real para máxima transparencia.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-hover border-l-4 border-l-blue-500">
              <CardHeader>
                <Shield className="h-10 w-10 text-blue-500 mb-3" />
                <CardTitle className="text-xl">Seguridad Garantizada</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Verificación de usuarios, pagos seguros y protección de datos personales con los más altos estándares.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-hover border-l-4 border-l-red-500">
              <CardHeader>
                <Heart className="h-10 w-10 text-red-500 mb-3" />
                <CardTitle className="text-xl">Donaciones Monetarias</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Además de alimentos, permite donaciones monetarias para campañas específicas y necesidades urgentes.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-hover border-l-4 border-l-teal-500">
              <CardHeader>
                <HandHeart className="h-10 w-10 text-teal-500 mb-3" />
                <CardTitle className="text-xl">Eventos Solidarios</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Organiza y participa en eventos comunitarios, campañas especiales y actividades de voluntariado.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-primary via-primary/80 to-secondary relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -z-10"></div>
        
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">Únete a Nuestra Misión</h2>
          <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
            Cada donación cuenta. Cada gesto importa. Juntos podemos crear un mundo sin hambre y sin desperdicio de alimentos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-100 font-semibold shadow-lg hover:shadow-xl transition-all">
              <Link href="/auth">Registrarse Gratis</Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-white/20 text-white border-2 border-white hover:bg-white/30 font-semibold backdrop-blur-sm"
            >
              <Link href="/contacto">Contactar</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-10 w-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <span className="font-bold text-lg font-display">Banco de Alimentos</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Conectando generosidad con necesidad para un mundo mejor.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-white">Plataforma</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/como-funciona" className="hover:text-primary transition-colors">
                    Cómo Funciona
                  </Link>
                </li>
                <li>
                  <Link href="/seguridad" className="hover:text-primary transition-colors">
                    Seguridad
                  </Link>
                </li>
                <li>
                  <Link href="/precios" className="hover:text-primary transition-colors">
                    Precios
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-white">Comunidad</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/voluntarios" className="hover:text-primary transition-colors">
                    Voluntarios
                  </Link>
                </li>
                <li>
                  <Link href="/organizaciones" className="hover:text-primary transition-colors">
                    Organizaciones
                  </Link>
                </li>
                <li>
                  <Link href="/eventos" className="hover:text-primary transition-colors">
                    Eventos
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-white">Soporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/ayuda" className="hover:text-primary transition-colors">
                    Centro de Ayuda
                  </Link>
                </li>
                <li>
                  <Link href="/contacto" className="hover:text-primary transition-colors">
                    Contacto
                  </Link>
                </li>
                <li>
                  <Link href="/privacidad" className="hover:text-primary transition-colors">
                    Privacidad
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p className="mb-2">
              &copy; 2024 Banco de Alimentos Virtual. Todos los derechos reservados.
            </p>
            <p className="text-sm">Conectando generosidad con necesidad para un mundo mejor.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
