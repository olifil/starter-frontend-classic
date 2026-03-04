import { toast } from 'vue-sonner'

export class Toast {
  error(title: string, content: string) {
    return toast.error(title, {
      description: content,
      position: 'top-center',
    })
  }

  success(title: string, content: string) {
    return toast.success(title, {
      description: content,
      position: 'top-center',
    })
  }
}
