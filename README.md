## Installation instructions:

Set up Node/NPM (Node Package Manager) on your machine.

Then, from your home directory (`~`), run the following commands:

`npm install express@2.5` (this installs Express)

`npm install socket.io express` (this installs Socket.io–an all-browser means of utilizing web sockets)

`npm install jade express` (this installs the Jade templating engine)

## Troubleshooting

If you try to use Express 3.0 instead of 2.5, you'll likely get this error:
http://stackoverflow.com/questions/10191048/socket-io-js-not-found

You can fix it with:

`npm uninstall express`
`npm install express@2.5`
