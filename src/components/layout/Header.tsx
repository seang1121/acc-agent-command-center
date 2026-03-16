import { SearchBar } from './SearchBar'
import { loadConfig } from '../../config/loader'

interface Props {
  search: string
  onSearchChange: (value: string) => void
}

export function Header({ search, onSearchChange }: Props) {
  const config = loadConfig()

  return (
    <header className="border-b border-gray-800 bg-gray-950 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {config.title}
          </h1>
          <p className="text-sm text-gray-500">
            All projects, agents, and automations in one place
          </p>
        </div>
        <div className="hidden sm:block">
          <SearchBar value={search} onChange={onSearchChange} />
        </div>
      </div>
    </header>
  )
}
