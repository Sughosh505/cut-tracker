import { Link } from 'react-router-dom'

export function NoActiveCut({ message }: { message: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-gray-500">{message}</p>
      <Link
        to="/start-cut"
        className="min-h-11 rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white"
      >
        Start a Cut
      </Link>
    </div>
  )
}
