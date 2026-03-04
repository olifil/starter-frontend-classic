import type { ContactRequest } from '@/core/domain/types/contact.types'
import { HttpAdapter } from './http-adapter'
import type { ContactRepository } from '@/core/domain/ports/contact.repository'

export class ContactHttpAdapter
  extends HttpAdapter
  implements ContactRepository
{
  constructor() {
    super('contact')
  }

  async contact(data: ContactRequest): Promise<void> {
    return this.post('', data)
  }
}
