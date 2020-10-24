import fs from 'fs'
import qs from 'querystring'
import fetch from 'isomorphic-unfetch'
import FormData from 'form-data'

import {ENDPOINT, STICKER} from './consts'

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

export type TokenResponse = {
  access_token: string
}

export type SendOption = {
  message: string,
  image?: string | {fullsize: string, thumbnail: string},
  sticker?: keyof typeof STICKER | {packageId: number, id: number}
  notificationDisabled?: boolean
}

export type AuthorizeOption = {
  response_type: 'code'
  scope: 'notify'
  client_id: string
  redirect_uri: string
  state: string
  response_mode?: 'form_post'
}

export type TokenOption = {
  grant_type: 'authorization_code'
  code: string
  redirect_uri: string
  client_id: string
  client_secret: string
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

  public accessToken: string
  public ratelimit?: RateLimit

  constructor({token}: NotifyOption) {
    this.accessToken = token
  }

  private async req(type: 'api' | 'oauth', path: string, param?: RequestInit) {
    const url = ENDPOINT.notify[type] + path
    const headers = {Authorization: `Bearer ${this.accessToken}`, ...param?.headers}
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

  private get(type: 'api' | 'oauth', path: string, query?: Record<string, any>) {
    const q = query ? '?' + qs.stringify(query) : ''
    return this.req(type, path + q, {method: 'get'})
  }

  private post(type: 'api' | 'oauth', path: string, formData: FormData) {
    // @ts-ignore
    return this.req(type, path, {method: 'post', headers: formData.getHeaders(), body: formData})
  }

  status(): Promise<StatusResponse> {
    return this.get('api', '/status')
  }

  revoke(): Promise<RevokeResponse> {
    return this.get('api', '/revoke')
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

    if (notificationDisabled !== void (0)) {
      formData.append('notificationDisabled', notificationDisabled)
    }

    return this.post('api', '/notify', formData)

  }

  authorize(opt: AuthorizeOption): Promise<void> {
    return this.get('oauth', '/authorize', opt)
  }

  token(opt: TokenOption): Promise<TokenResponse> {
    const formData = new FormData()
    formData.append('grant_type', opt.grant_type)
    formData.append('code', opt.code)
    formData.append('redirect_uri', opt.redirect_uri)
    formData.append('client_id', opt.client_id)
    formData.append('client_secret', opt.client_secret)
    return this.post('oauth', '/token', formData)
  }

}
