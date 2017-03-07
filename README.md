# line-api
Simple LINE api for node.js.

(Currently only supports Notify API.)

## Install
`npm install line-api`

## Initialization

```js
import LineAPI from 'line-api'

const notify = new LineAPI.Notify({
	token: <YOUR_TOKEN_HERE>
})
```

## Methods

### notify.status()

Check the status of given token.  
Returns a **Promise object**.

```js
notify.status().then(console.log)
// { status: 200, message: 'ok', targetType: 'USER', target: 'Yuhsak' }
```

### notify.send()

Send message.  
Attaching image is currently _not supported_.  
Returns a **Promise object**.

For sticker param, you can use one of shorthands below.  

- sleep
- smile
- surprise
- admire
- fun
- angry
- you
- scare
- cry
- laugh
- sing
- fight
- good
- ok

Or specify exact stickerPackageId and stickerId suggested in [https://devdocs.line.me/files/sticker_list.pdf](https://devdocs.line.me/files/sticker_list.pdf).

```js
notify.send({
	message: 'Test message',
	sticker: 'smile' // shorthand
	// sticker : { packageId: 1, id: 2 } // exact ids
}).then(console.log)
// { status: 200, message: 'ok' }
```

### notify.revoke()

Revoke given token.  
Returns a **Promise object**.

```js
notify.revoke()
// { status: 200, message: 'ok' }
```

## Props

### notify.ratelimit

Check the rate limit of LINE Notify API for given token.  
Note that you must call one of these methods status() and send() at least one time to make this prop ready.

```js
notify.status().then(()=>{console.log(notify.ratelimit)})
/*
{
	request: {
		limit: 1000,
		remain: 999
	},
	image: {
		limit: 50,
		remain: 50
	},
	reset: 2017-03-07T11:47:36.000Z
}
*/
```