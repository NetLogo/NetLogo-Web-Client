## Installation instructions:

### Prerequisites

Set up Node/NPM (Node Package Manager) on your machine.

Then, from your home directory (`~`), run the following commands:

`npm install express@2.5` (this installs Express)

`npm install socket.io express` (this installs Socket.io–an all-browser means of utilizing web sockets)

`npm install jade express` (this installs the Jade templating engine)

### IP address configuration

An IP address is hardcoded in several source files. You'll need to replace it with your own IP address.
You can locate the places you need to edit with:  
`git grep 129.105.107.162`

## Running

To start the server, run this command:  
`node app.js`

Then in your web browser, navigate to [http://localhost:3000](http://localhost:3000).

## Troubleshooting

If you try to use Express 3.0 instead of 2.5, you'll likely get this error:
http://stackoverflow.com/questions/10191048/socket-io-js-not-found

You can fix it with:

`npm uninstall express`
`npm install express@2.5`
