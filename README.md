# The Trello Admin Board
This is a trello power-up that allows you to sync your cards into a specific board, called the admin board.

## Why this power-up?
We use Trello extensively in our team to keep track of our progress in several projects and to prioritize our work in the following weeks. All of our boards follow the same list structure to make things easier (backlog, to-do, in progress, etc.).

At some point, it became annoying as a user to have to navigate through the boards to check what has to be done each week. 'Wouldn't it be awesome if we could centralize a set of cards in one single board?', we asked ourselves. From this question, the Trello Admin Board project was born.

## What can this extension do?
* Synchronize the cards you want, so these are all centralized in an Admin Board.
* The synced cards reflect any changes done to the original:
    * Comments will be added/updated/deleted.
    * New lists are created in the Admin Board if needed when the original card is moved.
    * The synced card disappears once the original is deleted.

![trello-admin-board](assets/img/trello_firstsync.gif)

## Installing the Extension
The installation consists of 2 parts:
1. Setting up a web server that listens to the Webhooks sent by Trello and acts as middleware between the power-up and the Trello API.
2. Adding your Trello credentials as environment values.
3. Installing the Trello power-up in the boards you want to sync.

### Running the web server
The first requisite to run the extension is to run it in a machine accessible through port 443 (HTTPS). **We recommend importing this repository into a [Glitch](https://www.google.com) project**, as it will take care of installing the dependencies and setting up the proxy to redirect the requests to the *node.js* server.

However, if you have a web server ready, you may use it to install the extension:
1. First, install the Trello Admin Board by cloning this repository and installing the dependencies.
    ```
    npm install
    ```
2. Then run your server using:
    ```
    npm start
    ```
3. You should see a message in your console saying that the server is up and running.

### Adding your Trello credentials
In order to authenticate against the Trello API, the server needs the Trello credentials of the project administrator.
