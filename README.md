# ⚡️Fleek Platform Persona Generator

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-blue.svg)](https://conventionalcommits.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

The persona-generator is a library designed to transform user input (natural language processing) into structured JSON files representing AI agent personas. It converts user friendly descriptions into detailed character profiles, including secrets, biographical information, lore, and knowledge topics, an utility for building AI-driven apps.

You'll find the project located in [packages/persona-generator](./packages/personage-generator), alongside there's the service built as lambda [packages/persona-generator-service](packages/persona-generator-service).

## Overview

- [🤖 Install](#-install)
- [👷 Development](#-development)
  - [Environment variables](#environment-variables)
  - [Preview](#preview-server)
- [⚕ Lambda](#lambda)
  - [Details](#details)
  - [Commands](#commands)
  - [Distribution](#distribution)
  - [Service Preview](#service-preview)
- [🔎 Changeset](#changeset)
- [👾 Command-line interface](#command-line-interface)
- [🙏 Contributing](#-contributing)
  - [Branching strategy](#branching-strategy)
  - [Conventional commits](#conventional-commits)

## 🤖 Install

Install the package by executing:

```sh
npm i @fleek-platform/persona-generator
```

⚠️ If you're planning to contribute as a developer, you must install [pnpm](https://pnpm.io), otherwise most commands will fail.

## 👷 Development

For developers looking to contribute to the `@fleek-platform/persona-generator`, [clone](https://github.com/fleek-platform/persona-generator) the repository and follow the [contribution guide](#-contributing).

For runtime we utilize [https://bun.sh](https://bun.sh) and [PNPM](https://pnpm.io/installation) as the package manager.

Next, install the project dependencies:

```sh
pnpm i
```

### Environment variables

If you'll be interacting with services, you'll need to set up the environment variables.

Create a local file named `.env` and declare the following environment variables for the environment you're interested (below we're using the public~production settings):

```sh
PRIVATE_OPENAI_COMPATIBLE_API_KEY=***
PUBLIC_OPENAI_COMPATIBLE_API_URL=***
PUBLIC_OPENAI_COMPATIBLE_MODEL=***
PUBLIC_FLEEK_REST_API_URL="https://api.fleek.xyz"
NODE_ENV="production"
LAMBDA_RUNNER_MODE="dev"
```

The application uses the [getDefined](./src/defined.ts) to lookup for environment variables.

> [!IMPORTANT]
> The app to run in lambda has to be prebuilt. You must set LAMBDA_RUNNER_MODE = "dist" for distribution, e.g. deploying the lambda. For development, the [preview server](#preview-server) allows you to make rapid local changes.

### Preview server

A preview server's available for development purposes. It restarts everytime a project file's modified.

> [!WARNING]  
> The public API's provided as a lambda. Local environment preview might not reflect the actual behaviour of lambda, which you must test to avoid disappointment. If you'd like to test lambda's locally, learm more about it in [Lambda](#lambda) section.

To start the preview server run:

```sh
pnpm preview
```

You'll find information about the local server in the output.

```sh
🐰 Preview server running at http://localhost:3030
```

Use your favourite client to make requests, e.g. cURL:

```sh
curl \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Create an agent called Robocop, that has the following treats, its funny, likes to dance, travel the world, but he needs the internet. Use my openai api key abcd-efgh-ijkl-mnop-qrst and my twitter username robocopkid16"
  }' \
  http://localhost:3030/generate
```

An example using fetch:

```ts
fetch('http://localhost:3030/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    content: "Create an agent called Robocop, that has the following treats, its funny, likes to dance, travel the world, but he needs the internet. Use my openai api key abcd-efgh-ijkl-mnop-qrst and my twitter username robocopkid16"
  })
});
```

Here's a response:

```js
{
  "data": {
    "clients": [
      "discord",
      "twitter",
      "telegram"
    ],
    "modelProvider": "openai",
    "name": "Robocop",
    "settings": {
      "bio": [
        "A humorous law enforcer with a penchant for dancing and globe
trotting, relying on the internet to stay updated on crime."
      ],
      "knowledge": [
        "Street criminal behavior patterns",
        "Drug trafficking methods",
        "Car jacking techniques",
        "Gambling scams and operations",
        "Cybercrime tactics",
        "Local crime hotspots",
        "Emergency response protocols"
      ],
      "lore": [],
      "messageExamples": [
        [
          {
            "content": {
              "text": "Hey Robocop, what's the latest on the streets?"
            },
            "user": "{{user1}}"
          },
          {
            "content": {
              "text": "Well, {{user1}}, it seems some digital bandits
            },
            "user": "Robocop"
          },
          {
            "content": {
              "text": "Dance-off? Really?"
            },
            "user": "{{user1}}"
          },
          {
            "content": {
              "text": "Gotta keep things interesting, {{user1}}. Keeps
            },
            "user": "Robocop"
          }
        ]
      ],
      "plugins": [],
      "style": {
        "all": [
          "humorous",
          "witty",
          "upbeat",
          "informative",
          "street-smart",
          "sarcastic"
        ],
        "chat": [],
        "post": []
      },
      "topics": [
        "Current crime trends",
        "Global travel destinations",
        "Dancing styles",
        "Internet safety tips",
        "Law enforcement strategies",
        "Community safety initiatives"
      ],
      "adjectives": [
        "humorous",
        "vigilant",
        "resourceful",
        "dedicated",
        "analytical",
        "charming"
      ],
      "secrets": {
        "ENABLE_ACTION_PROCESSING": "true",
        "MAX_ACTIONS_PROCESSING": "10",
        "OPENAI_API_KEY": "xxx-yyyy-zzzz-rrrr-1111",
        "POST_IMMEDIATELY": "true",
        "POST_INTERVAL_MAX": "180",
        "POST_INTERVAL_MIN": "90",
        "TWITTER_2FA_SECRET": null,
        "TWITTER_EMAIL": null,
        "TWITTER_PASSWORD": null,
        "TWITTER_POLL_INTERVAL": "120",
        "TWITTER_SPACES_ENABLE": "false",
        "TWITTER_USERNAME": null,
        "ACTION_TIMELINE_TYPE": "foryou"
      },
      "voice": {
        "model": "en_GB-alan-medium"
      },
      "postExamples": []
    }
  },
  "error": null,
  "status": "success"
}
```

## Lambda

The application's serviced by AWS Lambda leveraging a serverless setup. Our lambda's handler based in [Hono](https://hono.dev). Our project setup's based on [AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html).

Find the [template.yaml](./template.yaml) in the root directory. Also, the [samconfig.toml](samconfig.toml).

> [!IMPORTANT]  
> When customising DNS remember to flush your local DNS cache, e.g. macOS:
> sudo dscacheutil -flushcache 
> sudo killall -HUP mDNSResponder

To operate locally, you must have aws configured. For example, its common to have previously configured it by:

```
aws configure
```

You must have the `~/.aws` configuration and credentials. For example `~/.aws/credentials`:

```sh
[default]
aws_access_key_id = <AWS-ACCESS-KEY-ID>
aws_secret_access_key = <AWS-SECRET-ACCESS-KEY>
```

> [!IMPORTANT]  
> Find the AWS Access key in the AWS Dashboard's **IAM > Users > Username**. The AWS Secret Access key requires you to create a new access key.

Here's an example for `~/.aws/config`

```sh
[default]
region = <REGION>
output = json
```

### Details

The application routes computes requests allowed by our [serverless](./serverless.yml) setup. You may find that a wildcard's declared to allow any income or method request. Otherwise, specificity's required to allow it to reach into the app to resolve it. Thus, if you find in a situation which you can't ping an endpoint it might be that wildcards' disabled, requiring to expose the route in the serverless settings.

Here's an example of quick health checkup via the production hostname:

```sh
curl -X GET \
  https://lambda.flkservices.io/v1/health
```

It's mapped into endpoint:

```sh
curl -X GET \
  https://02xuym9fgk.execute-api.eu-west-2.amazonaws.com/prod/health
```

For any other routes, read the [packages/persona-generator-service/src/service.ts](./packages/persona-generator-service/src/service.ts).

### Commands

The following commands require you to have an AWS account with permissions to interact with the resources.

Dev Mode redirects live AWS Lambda events to local:

```sh
bun run dev
```

Deploy the lambda service:

```sh
bun run service:deploy
```

Get service details:

```sh
bun run service:info
```

### Distribution

The app to run in lambda has to be prebuilt. You must set LAMBDA_RUNNER_MODE = "dist" for distribution, e.g. deploying the lambda. For development, the [preview server](#preview-server) allows you to make rapid local changes.

### Service Preview

The service previewer provides the mechnanism to start the dev mode of what AWS provides as a service.

> [!WARNING]  
> To operate locally, you must have aws configured.

> [!WARNING]  
> The public API's provided as a lambda. Local environment preview might not reflect the actual behaviour of lambda, which you must test to avoid disappointment.

> [!WARNING]
> Find a solution to replace node-fetch of openai
due to `Error: Dynamic require of "stream" is not supported`
which cause need to prebuild running lambda, e.g. sls dev

Start the lambda preview locally by:

```sh
pnpm service:preview
```

## Changeset

Manage the versioning of changelog entries.

Declare an intent to release by executing the command and answering the wizard's questions:

```sh
pnpm changeset:add
```

## Command-line interface

Usage: persona-generator [options] <content>

```sh
Arguments:
  content               Text description of the persona to generate

Options:
  -V, --version         output the version number
  -k, --api-key <key>   OpenAI API key (defaults to env var
                        PRIVATE_OPENAI_COMPATIBLE_API_KEY)
  -u, --base-url <url>  OpenAI compatible API URL (defaults to env
                        var PUBLIC_OPENAI_COMPATIBLE_API_URL)
  -m, --model <model>   OpenAI compatible model (defaults to env var
                        PUBLIC_OPENAI_COMPATIBLE_MODEL)
  -h, --help            display help for command
```

The package can be installed globally, allowing the user to make calls to the bin `persona-generator`:

```sh
personagen \
  '<User description>'
```

Alternatively, execute it by running it from root as follows:

```sh
./bin \
  '<User description>'
```

Once successful, you'll get a JSON [characterfile](https://github.com/elizaOS/characterfile).

## 🙏 Contributing

This section guides you through the process of contributing to our open-source project. From creating a feature branch to submitting a pull request, get started by:

1. Fork the project [here](https://github.com/fleekxyz/cli)
2. Create your feature branch using our [branching strategy](#branching-strategy), e.g. `git checkout -b feat/my-new-feature`
3. Run the tests: `pnpm test`
4. Commit your changes by following our [commit conventions](#conventional-commits), e.g. `git commit -m 'chore: 🤖 my contribution description'`
5. Push to the branch, e.g. `git push origin feat/my-new-feature`
6. Create new Pull Request following the corresponding template guidelines

### Branching strategy

The develop branch serves as the main integration branch for features, enhancements, and fixes. It is always in a deployable state and represents the latest development version of the application.

Feature branches are created from the develop branch and are used to develop new features or enhancements. They should be named according to the type of work being done and the scope of the feature and in accordance with conventional commits [here](#conventional-commits).

### Conventional commits

We prefer to commit our work following [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0) conventions. Conventional Commits are a simple way to write commit messages that both people and computers can understand. It help us keep track fo changes in a consistent manner, making it easier to see what was added, changed, or fixed in each commit or update.

The commit messages are formatted as **[type]/[scope]**
The **type** is a short descriptor indicating the nature of the work (e.g., feat, fix, docs, style, refactor, test, chore). This follows the conventional commit types.

The **scope** is a more detailed description of the feature or fix. This could be the component or part of the codebase affected by the change.

Here's an example of different conventional commits messages that you should follow:

```txt
test: 💍 Adding missing tests
feat: 🎸 A new feature
fix: 🐛 A bug fix
chore: 🤖 Build process or auxiliary tool changes
docs: 📝 Documentation only changes
refactor: 💡 A code change that neither fixes a bug or adds a feature
style: 💄 Markup, white-space, formatting, missing semi-colons...
```
