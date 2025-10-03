'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

export default function AIPlayground() {
  const [message, setMessage] = useState('')
  const [conversation, setConversation] = useState<Array<{ role: 'user' | 'ai'; text: string }>>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const handleSendMessage = async () => {
    if (!message.trim()) return

    const userMessage = message
    setMessage('')
    setConversation((prev) => [...prev, { role: 'user', text: userMessage }])
    setIsProcessing(true)

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I understand your query. I'm processing this with advanced natural language understanding.",
        "Great question! Let me help you with that using our AI voice technology.",
        "I can assist you with that. Our multilingual AI can handle this in over 50 languages.",
        "Thank you for reaching out. I'm analyzing your request in real-time.",
      ]
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      setConversation((prev) => [...prev, { role: 'ai', text: randomResponse }])
      setIsProcessing(false)
    }, 1500)
  }

  return (
    <section
      id="playground"
      ref={ref}
      className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden"
    >
      {/* Background Effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary-500 to-accent-500 rounded-full blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-gradient">
            Try It Live
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Experience the power of AI Voice Bridge. Start a conversation and see the magic happen.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-morphism rounded-3xl p-8 max-w-3xl mx-auto"
        >
          {/* Chat Display */}
          <div className="bg-black/30 rounded-2xl p-6 mb-6 h-96 overflow-y-auto">
            {conversation.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <p>Start a conversation with our AI...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {conversation.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: msg.role === 'user' ? 50 : -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white'
                          : 'bg-gray-800 text-gray-200'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-gray-800 rounded-2xl px-4 py-3">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="flex gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 bg-black/30 rounded-xl px-6 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              disabled={isProcessing}
              className="px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </motion.button>
          </div>

          {/* Voice Visualizer Mock */}
          <div className="mt-6 flex items-center justify-center gap-1">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-gradient-to-t from-primary-500 to-accent-500 rounded-full"
                animate={{
                  height: isProcessing ? [8, 24, 8] : 8,
                }}
                transition={{
                  duration: 0.5,
                  repeat: isProcessing ? Infinity : 0,
                  delay: i * 0.05,
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
