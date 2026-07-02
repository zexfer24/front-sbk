'use client'

import { useState } from 'react'
import { Sidebar, type View } from '@/components/sidebar'
import { DashboardView } from '@/components/views/dashboard-view'
import { ChatView } from '@/components/views/chat-view'
import { CrmView } from '@/components/views/crm-view'
import { InventoryView } from '@/components/views/inventory-view'
import { motion, AnimatePresence } from 'framer-motion'

export default function Page() {
  const [view, setView] = useState<View>('panel')

  return (
    <div className="flex min-h-dvh">
      <Sidebar active={view} onNavigate={setView} />

      <div className="flex min-w-0 flex-1 flex-col relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={view}
            initial={{ opacity: 0, scale: 0.985, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.985, y: -10 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 32,
            }}
            className="flex flex-1 flex-col"
          >
            {view === 'panel' && <DashboardView />}
            {view === 'chat' && <ChatView />}
            {view === 'clientes' && <CrmView />}
            {view === 'inventario' && <InventoryView />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
