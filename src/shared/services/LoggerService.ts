type LogLevel = 'info' | 'warn' | 'error'

const print = (level: LogLevel, message: string, payload?: unknown) => {
  const prefix = `[RIAGRO][${level.toUpperCase()}] ${message}`
  if (level === 'info') {
    console.info(prefix, payload ?? '')
    return
  }
  if (level === 'warn') {
    console.warn(prefix, payload ?? '')
    return
  }
  console.error(prefix, payload ?? '')
}

export const LoggerService = {
  info: (message: string, payload?: unknown) => print('info', message, payload),
  warn: (message: string, payload?: unknown) => print('warn', message, payload),
  error: (message: string, payload?: unknown) => print('error', message, payload),
}
