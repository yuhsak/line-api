# line-api
Simple LINE api for node.js.

(Currently only supports Notify API.)

## Install
```sh
npm install line-api
```

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
Returns a **Promise object**.

```js
notify.send({
	message: 'Test message',
	sticker: 'smile' // shorthand
	// sticker : { packageId: 1, id: 2 } // exact ids
	image: 'test.jpg' // local file
	// image: { fullsize: 'http://example.com/1024x1024.jpg', thumbnail: 'http://example.com/240x240.jpg' } // remote url
}).then(console.log)
// { status: 200, message: 'ok' }
```

For sticker parameter, you can use one of these shorthands below.  

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

Or specify exact stickerPackageId and stickerId suggested at [https://devdocs.line.me/files/sticker_list.pdf](https://devdocs.line.me/files/sticker_list.pdf)

For image parameter, you can just specify with local file path, or remote file url.

If you specify with local file path, the file can be both jpeg format and png format.

If it's a remote url, the format must be a **JPEG** and these parameter _fullsize_ (up to 1024x1024 pixel) and _thumbnail_ (up to 240x240) both like example upon are required.

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
