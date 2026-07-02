'use client'

import { Banknote, MessagesSquare, Send } from 'lucide-react'
import { dayHours, hourly } from '@/lib/dashboard-data'
import { PageHeader } from '@/components/page-header'
import { KpiCards } from '@/components/dashboard/kpi-cards'
import { BarChartPanel } from '@/components/dashboard/bar-chart-panel'

export function DashboardView() {
  return (
    <>
      <PageHeader eyebrow="Centro de operaciones" title="Panel del día">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
          <span className="status-dot h-2 w-2 rounded-full bg-success text-success" />
          En vivo · hoy
        </span>
      </PageHeader>

      <main className="flex flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <KpiCards />

        <div>
          <h2 className="heading-stamp mb-4 text-sm text-muted-foreground">
            Actividad por hora
          </h2>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <BarChartPanel
              title="Ingresos generados"
              icon={Banknote}
              labels={dayHours}
              data={hourly.revenue}
              hue={25}
              baseDelay={0}
              format={(v) => `US$ ${v.toLocaleString('en-US')}`}
            />
            <BarChartPanel
              title="Interacción de clientes"
              icon={MessagesSquare}
              labels={dayHours}
              data={hourly.chats}
              hue={150}
              baseDelay={250}
              format={(v) => `${v} chats`}
            />
            <BarChartPanel
              title="Mensajes enviados"
              icon={Send}
              labels={dayHours}
              data={hourly.messages}
              hue={75}
              baseDelay={500}
              format={(v) => `${v} msgs`}
            />
          </div>
        </div>
      </main>
    </>
  )
}
