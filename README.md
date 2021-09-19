# Nice URL - Server

Highly secured URL Shortener demo app.  
The purpose of this app is to show a real life example of a website that has users, and how it handles stuff like permission, authentication, API calls etc.

You can see a live example in [https://niceurl.vercel.app](https://niceurl.vercel.app).  
To see your short url in action, create one then with the given alias go to [https://niceurl.herokuapp.com/](https://niceurl.herokuapp.com/)your-alias (make sure to enter an alias after the server url

> Note: this is part of a two repo project.  
> For the client see [https://github.com/niv54/url-shortener-client](https://github.com/niv54/url-shortener-client)

## Specs

Ordinary `express.js` app written in `Typescript`.  
Every entity in the API has it's own `router` (controller), `service`, and `model`.  
The DAL is implemented with `typeorm` so any relational DB could work, but for this example I'm using `postgres`.  
All the security related code is self implemented, including the creation and validation of tokens.  
API validation is enforced with `yup` models.

## What does this app offer?

### Security Wise

* Sign Up / Login  - username + password based
* Secured CRUD on short urls of each user
  * Create a URL
  * Update a URL
  * See all URLs that belong to the logged in user
  * Delete a URL
* JWT based authentication
  * Refresh token included
* Guest Login
  * allows to create short urls that do not belong to any user

### Server

#### Special short url features

| url | action |
| --- | --- |
| `server-url/alias` | redirect to full url |
| `server-url/alias?subroute` | redirect to full url's `/subroute` subroute |
| `server-url/alias??param=true` | redirect to full url and add query param `param=true` |
| `server-url/alias?subroute/another-sub-route?param=true` | redirect to full url's `/subroute/another-sub-route` subroute and add query param `param=true` |

Example:  
Assuming I have an short url for `https://google.com` called `google` - then I can do the following:

| url | redirected to |
| --- | --- |
| `server-url/alias` | `https://google.com` |
| `server-url/alias?search` | `https://google.com/search` |
| `server-url/alias??admin=true` | `https://google.com?admin=true` |
| `server-url/search?subroute?q=NIV54` | `https://google.com/search?q=NIV54` |

I've setup this example on the real website so you can try it out!  
[https://niceurl.herokuapp.com/google](https://niceurl.herokuapp.com/google)  
[https://niceurl.herokuapp.com/google?search](https://niceurl.herokuapp.com/google?search)  
[https://niceurl.herokuapp.com/google?search?q=NIV54](https://niceurl.herokuapp.com/google?search?q=NIV54)  

#### Other nice things

* If an alias is not found, you get redirected to the client in order to create one
* Indicative error codes and error messages
  * Default, and per route custom error handling
* Body validation
* Route guards
  * One that allows only logged in users
  * One that allows both logged in users and guests

## Run Me!

* Copy the content's of the example file under `config/local.example.json` to a new file `config/local.json` and fill out everything missing
  * If you're really interested, more configurable options are available in `config/default.json` - just edit them and re-run the server
* `npm run dev` or `npm run dev:watch` for hot reload

You should see your app load on [http://localhost:8080](http://localhost:8080)
