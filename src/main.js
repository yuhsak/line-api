import fs from 'fs'
import request from 'request-promise'
import validate from 'validate-arguments'
import config from '../config/config.json'
import stickerShorthands from '../config/sticker.json'

class Notify {
	
	constructor({token}) {
		if(!token) {
			throw new Error('Please initialize with {token} argument.')
		}
		this.token = token
		this.ratelimit = {
			request: {
				limit: null,
				remaining: null
			},
			image: {
				limit: null,
				remaining: null
			},
			reset: null
		}
	}
	
	req(args) {
		return new Promise((resolve, reject)=>{
			const validation = validate.named(args, {
				endpoint: 'string',
				formData: {
					isa: 'plainObject',
					optional: true
				}
			})
			const endpoint = validation.get('endpoint')
			const formData = validation.get('formData')
			const method = endpoint == 'status' ? 'get' : 'post'
			const headers = { Authorization: `Bearer ${this.token}` }
			if(method == 'post') headers['Content-Type'] = 'multipart/form-data'
			request(Object.assign({ method, headers, url: config.ENDPOINT_URL_NOTIFY[endpoint], resolveWithFullResponse: true }, formData ? {formData} : {}))
				.then(res=>{
					const header = res.headers
					const body = res.body
					this.ratelimit = {
						request: {
							limit: parseInt(header['x-ratelimit-limit']),
							remain: parseInt(header['x-ratelimit-remaining'])
						},
						image: {
							limit: parseInt(header['x-ratelimit-imagelimit']),
							remain: parseInt(header['x-ratelimit-imageremaining'])
						},
						reset: new Date(parseInt(header['x-ratelimit-reset'])*1000)
					}
					resolve(JSON.parse(body))
				})
				.catch(err=>{
					reject(JSON.parse(err.error))
				})
		})
	}
	
	status() {
		return this.req({endpoint: 'status'})
	}
	
	revoke() {
		return this.req({endpoint: 'revoke'})
	}
	
	send(args) {
		
		return Promise.resolve().then(()=>{

			const validation = validate.named(args, {
				message: 'string',
				// sticker: {
					// isa: 'string',
					// isa: {
					// 	packageId: { isa: 'number', optional: true },
					// 	id: { isa: 'number', optional: true },
					// },
					// optional: true
				// },
				// image: {
				// 	isa: 'string',
				// 	isa: {
				// 		thumbnail: { isa: 'string', optional: true },
				// 		fullsize: { isa: 'string', optional: true }
				// 	},
				// 	optional: true
				// }
			})
			
			if(!validation.isValid()) {
				throw new Error(validation.errorString())
			}
			
			const message = validation.get('message')
			const sticker = validation.get('sticker')
			const image = validation.get('image')
			const formData = {message}
			
			if(sticker) {
				if(typeof sticker == 'string') {
					if(Object.keys(stickerShorthands).includes(sticker)){
						[formData.stickerPackageId, formData.stickerId] = [stickerShorthands[sticker].packageId, stickerShorthands[sticker].id]
					}
				}
				if(typeof sticker == 'object' && sticker.packageId && sticker.id){
					[formData.stickerPackageId, formData.stickerId] = [sticker.packageId, sticker.id]
				}
			}
			
			if(image) {
				if(typeof image == 'string') {
					formData.imageFile = fs.createReadStream(image)
				}
				if(typeof image == 'object' && image.fullsize && image.thumbnail) {
					[formData.imageFullsize, formData.imageThumbnail] = [image.fullsize, image.thumbnail]
				}
			}
			
			return this.req({endpoint: 'send', formData})
		
		})
		
	}
	
}

const LineAPI = {
	Notify
}

export default LineAPI
