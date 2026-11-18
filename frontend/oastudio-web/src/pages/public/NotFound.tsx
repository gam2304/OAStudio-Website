import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="page-x flex min-h-[70vh] flex-col items-center justify-center pt-40 text-center">
      <p className="label-caps mb-6 text-gold">404</p>
      <h1 className="display-xl mb-10">This space is empty.</h1>
      <Link to="/" className="label-caps border-b border-ink/30 pb-1 hover:border-bronze hover:text-bronze">
        Return home
      </Link>
    </div>
  )
}
