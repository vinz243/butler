# Beetler

beetler is a quick nodejs server program that aims at serving static file using only a secure random URL without authentification.

The most common use case is in a seedbox, for sharing a file or a folder with a friend/kin without setting up a full FTP server.

It can serve directory by creating a zip and streaming it on-the-fly, without taking additional space (the zip isn't stored on drive).

Everything is in memory, so restart beetler will lose any dir!
### Installation

```
npm install yarn
yarn global add beetler pm2
```

You will need nginx proxy to `localhost:2986`

### Usage


To start server in the background:

```
$ pm2 start beetler-www
```

To add a file or a folder to serve:

```
$ beetler-add /absolute/path/to/file/or/folder
{id: "<object-id>", auth: "<auth-key>", url: "localhost:2986/<object-id>/<auth-key>"}
```

### Feature ideas

- save shared files/folders to disk and load them on start
- auth key timeout/max use times
- web interface
- change port/listening interface
