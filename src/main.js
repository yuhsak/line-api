import qs from 'qs'
import request from 'request-promise'
import validate from 'validate-arguments'
import config from '../config.json'

class Notify {
	
	constructor({token}) {
		if(!token) {
			throw new Error('Please initialize with {token} argument.')
		}
		this.token = token
	}
	
	get requestHeader() {
		return { 
			get: { Authorization: `Bearer ${this.token}` },
			post: Object.assign({ Authorization: `Bearer ${this.token}` }, { 'Content-Type': 'application/x-www-form-urlencoded' })
		}
	}
	
	get stickerShorthands() {
		return {
			'sleep': {
				packageId: 1,
				id: 1
			},
			'smile': {
				packageId: 1,
				id: 2
			},
			'surprise': {
				packageId: 1,
				id: 3
			},
			'admire': {
				packageId: 1,
				id: 4
			},
			'fun': {
				packageId: 1,
				id: 5
			},
			'angry': {
				packageId: 1,
				id: 6
			},
			'you': {
				packageId: 1,
				id: 7
			},
			'scare': {
				packageId: 1,
				id: 8
			},
			'cry': {
				packageId: 1,
				id: 9
			},
			'laugh': {
				packageId: 1,
				id: 10
			},
			'sing': {
				packageId: 1,
				id: 11
			},
			'fight': {
				packageId: 1,
				id: 13
			},
			'good': {
				packageId: 1,
				id: 13
			},
			'ok': {
				packageId: 1,
				id: 13
			},
		}
	}
	
	status() {
		return request.get({
			url: config.ENDPOINT_URL_NOTIFY.status,
			headers: this.requestHeader.get
		}).then(res=>JSON.parse(res))
	}
	
	revoke() {
		return request.post({
			url: config.ENDPOINT_URL_NOTIFY.revoke,
			headers: this.requestHeader.post,
		}).then(res=>JSON.parse(res))
	}
	
	send(args) {
		
		const validation = validate.named(args, {
			message: 'string',
			sticker: {
				isa: {
					packageId: { isa: 'number', optional: true },
					id: { isa: 'number', optional: true },
					shorthand: { isa: 'string', optional: true }
				},
				optional: true
			},
			image: {
				isa: {
					thumbnail: { isa: 'string', optional: true },
					fullsize: { isa: 'string', optional: true },
					file: { isa: 'string', optional: true }
				},
				optional: true
			}
		})
		
		const message = validation.get('message')
		const sticker = validation.get('sticker')
		const image = validation.get('image')
		
		const formData = {message}
		
		if(sticker) {
			if(sticker.shorthand) {
				if(Object.keys(this.stickerShorthands).includes(sticker.shorthand)){
					formData.stickerPackageId = this.stickerShorthands[sticker.shorthand].packageId
					formData.stickerId = this.stickerShorthands[sticker.shorthand].id
				}
			}
			if(sticker.packageId && sticker.id){
				formData.stickerPackageId = sticker.packageId
				formData.stickerId = sticker.id
			}
		}
		
		// if()
		
		return request.post({
			url: config.ENDPOINT_URL_NOTIFY.send,
			headers: this.requestHeader.post,
			formData
		})
		.then(res=>JSON.parse(res))
	}
	
}

const LineAPI = {
	Notify
}

export default  LineAPI
