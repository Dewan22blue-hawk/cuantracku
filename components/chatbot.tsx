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
        transition={{ delay: 1, type: "spring", stiffness: 100 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          isIconOnly
          size="lg"
          className="rounded-full h-16 w-16 neumorphic-shadow-hard"
          onClick={() => setOpen(true)}
        >
          <MessageCircle size={32} />
        </Button>
      </motion.div>
      <ChatDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
