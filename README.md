# Queue Bot

Queue Bot is a Discord bot designed to manage a queue system within a Discord server. This bot allows users to be added to or removed from a queue, view the current queue, and manage queue settings such as the channel where the queue is displayed.

## Features

- **Set Queue Channel:** Set a specific channel to display the current queue.
- **Add to Queue:** Add users to the queue with specific items.
- **Remove from Queue:** Remove users from the queue.
- **Clear Queue:** Clear the entire queue.
- **View Queue:** Display the current queue status.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16.6.0 or higher)
- npm (Node package manager)
- A [MongoDB](https://www.mongodb.com/) database

## Installation

1. **Clone the repository:**

    ```sh
    git clone https://github.com/GeoSyOG/Queue-Bot.git
    cd Queue-Bot
    ```

2. **Install the required dependencies:**

    ```sh
    npm i discord.js
    npm i mongodb
    ```

3. **Configure the bot:**

    Create a `config.json` file in the root directory of the project and add your Discord bot token and MongoDB URI:

    ```json
    {
        "token": "YOUR DISCORD TOKEN",
        "mongoUri": "YOUR MONGODB URI",
        "clientId": "YOUR CLIENT ID"
    }
    ```

4. **Deploy the slash commands:**

    ```sh
    node deploy-commands.js
    ```

5. **Run the bot:**

    ```sh
    node index.js
    ```

## Usage

### Commands

#### `/setqueuechannel`
Sets the channel where the queue message will be displayed.

#### `/addq`
Adds a user to the queue with a specific item.

#### `/removeq`
Removes a user from the queue.

#### `/clearq`
Clears the entire queue.

#### `/queue`
Displays the current queue.

https://discord.gg/anon
