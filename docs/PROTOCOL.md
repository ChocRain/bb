Preamble
========

This document is a draft. Don't expect it to be up to date. It's more
meant to explain the principles in use than to document every single
aspect of the protocol. Also: The protocol is subject to change.

Basically the protocol is using message passing via socket.io. This
document describes the API the server provides for the client.


Conventions
===========

Naming
------

Each message has a type with a prefix: Messages send by the client
are prefixed with "client.", messages send by the server are prefixed
with "server.". Further more the types of messages are structured
hirachically.


Message flow
------------

For every message send by the client there must be a response.

Besides responses the server may send status updates to the clients.
In such a case no response by the client is expected. (Do we need
responses by the client. What would that mean?)


Decoupling
----------

Every message is exactly related to one event / action / request. There
are no messages that contain a combined state of multiple actions (e. g.
user's position and a chat message). Only exception: There may be
responses for requests of the client containing a "state dump", e. g.
the list of users in the current room. This means the client has to
request those "state dumps" explicitly.


Message body
------------

Every message body is structured as follows, e. g.:

  {
    "type": "client.user.enter",
    "payload": { ... } // payload is optional (?)
  }


Incoming
========

client.user.enter
-----------------

Payload:

  { "nick": "nickname" }

Response:

  erver.user.entered


client.chat.message
-------------------

Payload:

  { "text": "Message text goes here..." }

Response:

  server.chat.message


Outgoing
========

server.user.entered

  { "nick": "nickname" }

server.chat.message

  {
    "nick": "nickname",
    "text": "Message text goes here..."
  }

