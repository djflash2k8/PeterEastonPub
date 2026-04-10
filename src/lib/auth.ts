// Simple authentication configuration
export const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'Peter123!'
}

export function validateCredentials(username: string, password: string): boolean {
  return username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password
}
