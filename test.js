const Notify = require('./entrypoint').Notify
const token = require('./token.json')

const notify = new Notify({token: token.NOTIFY})

notify.status()
	.then(res=>{
		console.log(res)
		return notify.send({
			'message': 'Test message',
			'sticker': 'smile'
		})
	})
	.then(res=>{
		console.log(res)
		console.log(notify.ratelimit)
	})
	.catch(console.err)
