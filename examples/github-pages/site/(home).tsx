import { Link } from '../lib/client/index'

export default function Index() {
  return (
    <>
    <h1>Welcome to the GitHub pages example!</h1>
    <Link href="/about" onClick={() => {}} onMouseEnter={() => {}} onTouchStart={() => {}}>About</Link>
    </>
  )
}