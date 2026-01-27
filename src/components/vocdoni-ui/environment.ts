export const environment = {
  explorer: (env: string) => {
    let explorer = 'https://explorer.vote'
    if (['stg', 'dev'].includes(env)) {
      explorer = `https://${env}.explorer.vote`
    }
    return explorer
  },
  verifyVote: (env: string, proof: string) => `${environment.explorer(env)}/verify/#/${proof}`,
}
