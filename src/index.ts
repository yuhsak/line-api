import fs from 'fs'
import fetch from 'isomorphic-unfetch'
import FormData from 'form-data'

import {ENDPOINT, STICKER} from './consts'

export {ENDPOINT, STICKER}

export type NotifyOption = {
  token: string
}

export type RateLimit = {
  request: {
    limit: number
    remaining: number
  }
  image: {
    limit: number
    remaining: number
  }
  reset: Date
}

export type StatusResponse = {
  status: 200
  message: 'ok'
  targetType: string
  target: string
}

export type RevokeResponse = {
  staus: 200
  message: 'OK'
}

export type SendResponse = {
  staus: 200
  message: 'OK'
}

export type SendOption = {
  message: string,
  image?: string | {fullsize: string, thumbnail: string},
  sticker?: keyof typeof STICKER | {packageId: number, id: number}
  notificationDisabled?: boolean
}

export class NotifyError extends Error {

  public status: number

  constructor(param: {status: number, message?: string}) {
    super(param.message)
    this.name = 'NotifyError'
    this.status = param.status
  }

}

export class Notify {

  public token: string
  public ratelimit?: RateLimit

  constructor({token}: NotifyOption) {
    this.token = token
  }

  async req(path: string, param?: RequestInit) {
    const url = ENDPOINT.notify + path
    const headers = {Authorization: `Bearer ${this.token}`, ...param?.headers}
    return fetch(url, {...param, headers})
      .then(r => {
        const limit = r.headers.get('x-ratelimit-limit')
        const remaining = r.headers.get('x-ratelimit-remaining')
        const imageLimit = r.headers.get('x-ratelimit-imagelimit')
        const imageRemaining = r.headers.get('x-ratelimit-imageremaining')
        const reset = r.headers.get('x-ratelimit-reset')
        if (limit && remaining && imageLimit && imageRemaining && reset) {
          this.ratelimit = {
            request: {
              limit: parseInt(limit),
              remaining: parseInt(remaining)
            },
            image: {
              limit: parseInt(imageLimit),
              remaining: parseInt(imageRemaining)
            },
            reset: new Date(parseInt(reset) * 1000)
          }
        }
        return r.json()
      })
      .then(r => {
        if (r.status !== 200) {
          throw new NotifyError(r)
        }
        return r
      })
  }

  get(path: string) {
    return this.req(path, {method: 'get'})
  }

  post(path: string, formData: FormData) {
    // @ts-ignore
    return this.req(path, {method: 'post', headers: formData.getHeaders(), body: formData})
  }

  status(): Promise<StatusResponse> {
    return this.get('/status')
  }

  revoke(): Promise<RevokeResponse> {
    return this.get('/revoke')
  }

  send({message, image, sticker, notificationDisabled}: SendOption): Promise<SendResponse> {

    const formData = new FormData()
    formData.append('message', message)

    if (image) {
      if (typeof image === 'string') {
        formData.append('imageFile', fs.createReadStream(image))
      } else {
        formData.append('imageFullsize', image.fullsize)
        formData.append('imageThumbnail', image.thumbnail)
      }
    }

    if (sticker) {
      const {packageId, id} = typeof sticker === 'string' ? (STICKER[sticker] || {}) : sticker
      if (packageId && id) {
        formData.append('stickerPackageId', packageId)
        formData.append('stickerId', id)
      }
    }

    if (notificationDisabled !== void(0)) {
      formData.append('notificationDisabled', notificationDisabled)
    }

    return this.post('/notify', formData)

  }

}
