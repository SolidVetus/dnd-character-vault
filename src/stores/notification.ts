import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SnackbarQueueMessage } from 'vuetify'

export const useNotificationStore = defineStore('notifications', () => {
  const queue = ref<SnackbarQueueMessage[]>([])

  function notifyError(text: string) {
    queue.value.push({
      text,
      color: 'error',
      timeout: 6000,
    })
  }

  function notifySuccess(text: string) {
    queue.value.push({
      text,
      color: 'success',
      timeout: 3000,
    })
  }

  return { queue, notifyError, notifySuccess }
})
