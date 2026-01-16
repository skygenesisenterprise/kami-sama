import { Suspense } from "react"
import { WatchPageContent } from "./watch-content"

interface WatchPageProps {
  params: Promise<{ slug: string }>
}

export default async function WatchPage({ params }: WatchPageProps) {
  const { slug } = await params

  return (
    <Suspense fallback={null}>
      <WatchPageContent slug={slug} />
    </Suspense>
  )
}
