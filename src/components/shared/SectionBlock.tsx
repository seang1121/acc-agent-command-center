import type { ReactNode } from 'react'

interface Props {
  title: string
  count: number
  description?: string
  children: ReactNode
}

export function SectionBlock({ title, count, description, children }: Props) {
  return (
    <section>
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            {title}
          </h2>
          <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs font-mono text-gray-500">
            {count}
          </span>
        </div>
        {description && (
          <p className="mt-1 text-xs text-gray-500 leading-relaxed max-w-3xl">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  )
}
