import { Link } from 'react-router-dom'
import { Empty } from '../components/Notice'
import { usePageTitle } from '../utils/format'

export default function NotFound() {
  usePageTitle('Page not found')
  return (
    <main className="container py-5">
      <Empty title="This page does not exist">
        <Link to="/">Go to all movies</Link>
      </Empty>
    </main>
  )
}
