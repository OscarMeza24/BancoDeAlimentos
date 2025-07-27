"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Send, X, Minimize2, Maximize2, Bot, User } from "lucide-react"
import { getCurrentProfile } from "@/lib/auth"
import type { Profile } from "@/lib/supabase"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadProfile()
    initializeChat()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadProfile = async () => {
    try {
      const profileData = await getCurrentProfile()
      setProfile(profileData)
    } catch (error) {
      console.error("Error loading profile:", error)
    }
  }

  const initializeChat = () => {
    const welcomeMessage: Message = {
      id: "welcome",
      content: "¡Hola! Soy el asistente virtual del Banco de Alimentos. ¿En qué puedo ayudarte hoy?",
      sender: "bot",
      timestamp: new Date(),
    }
    setMessages([welcomeMessage])
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase()

    if (message.includes("donar") || message.includes("donación")) {
      return "Para donar alimentos, ve a la sección 'Alimentos' y haz clic en 'Donar Alimentos'. Allí podrás registrar los productos que quieres donar con toda la información necesaria."
    }

    if (message.includes("solicitar") || message.includes("pedir")) {
      return "Para solicitar alimentos, navega a la sección 'Alimentos' donde podrás ver todos los productos disponibles. Haz clic en 'Solicitar Alimento' en el producto que necesites."
    }

    if (message.includes("voluntario") || message.includes("evento")) {
      return "¡Genial que quieras ser voluntario! Ve a la sección 'Eventos' para ver las oportunidades de voluntariado disponibles. Puedes unirte a eventos existentes o crear nuevos."
    }

    if (message.includes("campaña") || message.includes("dinero")) {
      return "En la sección 'Campañas' puedes ver todas las campañas solidarias activas. Puedes hacer donaciones monetarias para apoyar causas específicas."
    }

    if (message.includes("mapa") || message.includes("ubicación")) {
      return "El mapa te muestra todas las ubicaciones de alimentos disponibles, eventos de voluntariado y organizaciones cerca de ti. Ve a la sección 'Mapa' para explorarlo."
    }

    if (message.includes("perfil") || message.includes("cuenta")) {
      return "Puedes actualizar tu información personal en la sección 'Perfil'. Allí también puedes ver tus estadísticas de participación y configurar tu cuenta."
    }

    if (message.includes("ayuda") || message.includes("help")) {
      return "Estoy aquí para ayudarte. Puedes preguntarme sobre:\n• Cómo donar alimentos\n• Cómo solicitar alimentos\n• Eventos de voluntariado\n• Campañas solidarias\n• Usar el mapa\n• Gestionar tu perfil"
    }

    if (message.includes("gracias") || message.includes("thank")) {
      return "¡De nada! Es un placer ayudarte. Si tienes más preguntas, no dudes en preguntarme."
    }

    // Respuesta por defecto
    return "Entiendo tu consulta. Para obtener ayuda específica, puedes contactar a nuestro equipo de soporte o explorar las diferentes secciones de la plataforma. ¿Hay algo específico en lo que pueda ayudarte?"
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Simular delay de respuesta del bot
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateBotResponse(inputValue),
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botResponse])
      setIsTyping(false)
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full h-14 w-14 shadow-lg bg-green-600 hover:bg-green-700"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
        <Badge className="absolute -top-2 -left-2 bg-red-500 text-white">Ayuda</Badge>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className={`w-80 shadow-xl transition-all duration-300 ${isMinimized ? "h-14" : "h-96"}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-green-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5" />
            <CardTitle className="text-sm">Asistente Virtual</CardTitle>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-6 w-6 p-0 text-white hover:bg-green-700"
            >
              {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0 text-white hover:bg-green-700"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-80">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      message.sender === "user" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <div className="flex items-center space-x-1 mb-1">
                      {message.sender === "bot" ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />}
                      <span className="text-xs opacity-75">
                        {message.sender === "bot" ? "Asistente" : profile?.full_name || "Tú"}
                      </span>
                    </div>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className="text-xs opacity-50 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg text-sm">
                    <div className="flex items-center space-x-1">
                      <Bot className="h-3 w-3" />
                      <span className="text-xs">Asistente está escribiendo...</span>
                    </div>
                    <div className="flex space-x-1 mt-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t p-3">
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isTyping} size="sm">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
