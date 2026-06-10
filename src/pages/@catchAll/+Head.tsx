import { usePageContext } from 'vike-react/usePageContext'

const description =
  'Vocdoni is an open, secure, and universally verifiable digital voting platform. Create and manage elections, referendums, and governance processes for any organization.'

const image = '/assets/vocdoni_icon.png'

export default function Head() {
  const title = usePageContext().globalContext.appEnv?.title ?? 'Vocdoni - Digital voting SaaS platform'

  return (
    <>
      <meta property='og:type' content='website' />
      <meta property='og:site_name' content='Vocdoni' />
      <meta property='og:title' content={title} />
      <meta property='og:description' content={description} />
      <meta property='og:image' content={image} />
      <meta name='description' content={description} />
      <meta name='twitter:card' content='summary' />
      <meta name='twitter:site' content='@vocdoni' />
      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:image' content={image} />
    </>
  )
}
