import type { ContactRequest } from '../types/contact.types'

export interface ContactRepository {
  contact(data: ContactRequest): Promise<void>
}
