export type Environment = 'production' | 'localhost'

export interface DomainConfig {
  main: string
  studios: string
  sso: string
  protocol: string
}

const DOMAINS: Record<Environment, DomainConfig> = {
  production: {
    main: 'kami-sama.tv',
    studios: 'studios.kami-sama.tv',
    sso: 'sso.kami-sama.tv',
    protocol: 'https',
  },
  localhost: {
    main: 'kami-sama.localhost',
    studios: 'studios.kami-sama.localhost',
    sso: 'sso.kami-sama.localhost',
    protocol: 'http',
  },
}

export function detectEnvironment(): Environment {
  if (typeof window === 'undefined') return 'production'
  return window.location.hostname.includes('localhost') ? 'localhost' : 'production'
}

export function getDomainConfig(): DomainConfig {
  return DOMAINS[detectEnvironment()]
}

export function getDomainUrl(service: 'main' | 'studios' | 'sso', path: string = ''): string {
  const config = getDomainConfig()
  return `${config.protocol}://${config[service]}${path}`
}

export function switchDomain(target: 'main' | 'studios' | 'sso', path: string): string {
  return getDomainUrl(target, path)
}
