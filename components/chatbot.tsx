'use client'

import { useState } from "react"
import { motion } from "framer-motion"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChatDialog } from "./chat-dialog"

export function Chatbot() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <motion.div
        initial={{ scale: 0, y: 100 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ delay: 1, type: 'spring', stiffness: 100 }}
        className="fixed bottom-24 right-6 z-[130] md:bottom-8 md:right-8"
      >
        <Button
          size="lg"
          className="rounded-full w-16 h-16 md:w-20 md:h-20 flex items-center justify-center neumorphic-shadow-hard"
          onClick={() => setOpen(true)}
        >
          <MessageCircle className="w-8 h-8 md:w-10 md:h-10" />
        </Button>
      </motion.div>
      <ChatDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
