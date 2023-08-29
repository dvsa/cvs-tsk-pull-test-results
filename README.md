# cvs-tsk-pull-test-results

This repo contains the source code for two AWS Lambdas that send vehicle test result data to Dynamics CE

### pull-test-results
1. Receives INSERT events from the `test-results` DynamoDB which are a result of a vehicle test being performed in either VTA or VTM.
2. Extracts the necessary information to be sent to Dynamics CE to bill the ATF for the test activity
3. Sends the test activity details to EventBridge to be subsequently sent to Dynamics CE via HTTPS

### pull-test-results-modify
1. Receives MODIFY events from the `test-results` DynamoDB which are caused by ammendments of a test result made in VTM.
2. Identifies the values that have changed within the test result record.
3. Sends the test amendment details to EventBridge to be subsequently sent to Dynamics CE via HTTPS to create a billing amendment on the original test activity
<br></br>
![Pull test result lambdas architectural diagram](./docs/Architecture.png)

## Feature toggles
Both lambdas utilise environment variables to enable specific functionality:
- pull-test-results 
  - `PROCESS_MODIFY_EVENTS` - Toggles whether the lambda processes MODIFY DynamoDB stream events (must be set to `'true'` to enable functionality)
- pull-test-results-modify 
  - `PROCESS_DESK_BASED_TESTS` - Toggles whether the lambda processeses desk based tests (must be set to `'true'` to enable functionality)

## Dependencies

The project runs on node 18.x with typescript and serverless framework. For further details about project dependencies, please refer to the `package.json` file.
[nvm](https://github.com/nvm-sh/nvm/blob/master/README.md) is used to manage node versions and configuration is per project using an `.npmrc` file.

## Running the project

Before running the project, the dependencies need to be installed using `npm install`. Once the dependencies are installed, you will be required to copy the `.env.example` file to `.env.local` in the root of the project. See these for information about [variables](https://www.serverless.com/framework/docs/providers/aws/guide/variables/) and [environment variables](https://www.serverless.com/framework/docs/environment-variables/) with serverless.
Please note that multiple `.env` files can be created, one per environment. Our current development environment is 'local'.

The application runs on port `:3001` by default.

### Environments

We use `NODE_ENV` environment variable to set the stage. `NODE_ENV` is set through npm scripts (package.json) to load the relevant `.env.<NODE_ENV>` file from the root folder into the `serverless.yml`.
If no `NODE_ENV` value is provided when running the scripts, it will default its `NODE_ENV` value to 'local' with the `.env.local` config file.

The defaulted values for 'stage' and 'region' are `'local'`. Please refer to the values provided in the `serverless.yml` file.

The following values can be provided when running the scripts with `NODE_ENV`:

```ts
// ./.env.<NODE_ENV> files
'local'; // used for local development
'development'; // used development staging should we wish to require external services
'test'; // used during test scripts where local services, mocks can be used in conjunction
```

```ts
/** Running serverless offline as an example for a specific stage - 'local'.
* Stage 'local' will be injected in the serverless.yml
**/
NODE_ENV=local serverless offline

```

Further details about environment setup can be found in the provided documentation and `.env.example` file.

All secrets will stored in `AWS Secrets Manager`.

### Scripts

The following scripts are available, for further information please refer to the project `package.json` file:

- <b>start</b>: `npm start` - _launch serverless offline service_
- <b>dev</b>: `npm run dev` - _run in parallel, the service and unit tests in_ `--watch` _mode with live reload_.
- <b>test</b>: `npm t` - _execute the unit test suite_
- <b>build</b>: `npm run build` - _build the project, transpiling typescript to javascript_
- <b>production build</b>: `npm run package` - _generate the project zip file ready for deployment_

### Offline

Serverless-offline is used to run the project locally. Use `npm run start` script to do so. The endpoints below are available.

```
(POST) http://localhost:3002/2015-03-31/functions/cvs-tsk-pull-test-results-local-pullTestResultsInsert/invocations
(POST) http://localhost:3002/2014-11-13/functions/cvs-tsk-pull-test-results-local-pullTestResultsInsert/invoke-async/
(POST) http://localhost:3002/2015-03-31/functions/cvs-tsk-pull-test-results-local-pullTestResultsModify/invocations
(POST) http://localhost:3002/2014-11-13/functions/cvs-tsk-pull-test-results-local-pullTestResultsModify/invoke-async/
```

The function expects a DynamoDB stream event.
```json
{
  "eventID": "mock-id",
  "eventName": "MODIFY",
  "eventVersion": "1.1",
  "eventSource": "aws:dynamodb",
  "awsRegion": "eu-west-1",
  "dynamodb": {
      "ApproximateCreationDateTime": 1641807422,
      "Keys": {
          "vin": {
              "S": "123456"
          },
          "testResultId": {
              "S": "123"
          }
      },
      "NewImage": {
          ...
      },
      "OldImage": {
          ...
      },
      "SequenceNumber": "123456789",
      "SizeBytes": 3701,
      "StreamViewType": "NEW_AND_OLD_IMAGES"
  },
  "eventSourceARN": "mock-arn"
}
```
Complete examples can be found in the `./tests/unit/data` folder.

### Debugging

Existing configuration to debug the running service has been made available for vscode, please refer to `.vscode/launch.json`. Two jest configurations are also provided which will allow debugging a test or multiple tests.

## Environmental variables

The following variables are supported in the `.env.<NODE_ENV>` file.
- AWS_PROVIDER_PROFILE=default
- AWS_REGION=eu-west-1
- AWS_SERVER_PORT=3009
- AWS_EVENT_BUS_NAME=default
- AWS_EVENT_BUS_SOURCE=eventBusName
- PROCESS_MODIFY_EVENTS=false
- PROCESS_DESK_BASED_TESTS=false

## Testing

### Unit

Jest is used for unit testing. Jest mocks have been added for external services and other dependencies when needed. Debugging tests is possible using the two options configured in ./vscode/launch.json `Jest Debug all tests` and `Jest Debug opened file`. Using the Jest vscode extension is also a very good option. Please refer to the [Jest documentation](https://jestjs.io/docs/en/getting-started) for further details.

## Infrastructure

### Release

Releases (tag, release notes, changelog, github release, assets) are automatically managed by [semantic-release](https://semantic-release.gitbook.io/semantic-release/) and when pushing (or merging) to `develop` branch which is protected. [semver](https://semver.org/) convention is followed.

Please be familiar with conventional commit as described in the Contributing section below.

Default preset used is angular for conventional commits, please see the [angular conventions](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional#type-enum).

The `<type>` `'breaking'` in the commit message will trigger a major version bump as well as any of the following text contained in the commit body: `"BREAKING CHANGE", "BREAKING CHANGES", "BREAKING_CHANGES", "BREAKING", "BREAKING_CHANGE"`. Please refer to the `.releaserc.json` file for the full configuration.

The script `npm run release` will automatically trigger the release in CI. To manually test the release the following flags -`--dry-run --no-ci` - can be passed to the release script.

Publishing and artifacts are managed separately by the pipeline.

## Contributing

To facilitate the standardisation of the code, a few helpers and tools have been adopted for this repository.

### External dependencies

The projects has multiple hooks configured using [husky](https://github.com/typicode/husky#readme) which will execute the following scripts: `audit`, `lint`, `build`, `test` and format your code with [eslint](https://github.com/typescript-eslint/typescript-eslint#readme) and [prettier](https://github.com/prettier/prettier).

You will be required to install [git-secrets](https://github.com/awslabs/git-secrets) (_brew approach is recommended_) that runs against your git log history to find accidentally committed passwords, private keys.

We follow the [conventional commit format](https://www.conventionalcommits.org/en/v1.0.0/) when we commit code to the repository and follow the [angular convention](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional#type-enum).

The type is mandatory and must be all lowercase.
The scope of your commit remain is also mandatory, it must include your ticket number and be all lowercase. The format for the ticket number can be set in the commitlint.config.js file.

```js
// Please see /commitlint.config.js for customised format

type(scope?): subject

// examples
'chore(cvsb-1234): my commit msg' // pass
'CHORE(cvsb-1234): my commit msg' // will fail

```

### Code standards

#### Toolings

The code uses [eslint](https://eslint.org/docs/user-guide/getting-started), [typescript clean code standards](https://github.com/labs42io/clean-code-typescript) as well as sonarqube for static analysis.
SonarQube is available locally, please follow the instructions below if you wish to run the service locally (brew is the preferred approach):

- _Brew_:

  - Install sonarqube using brew
  - Change `sonar.host.url` to point to localhost, by default, sonar runs on `http://localhost:9000`
  - run the sonar server `sonar start`, then perform your analysis `npm run sonar-scanner`

- _Manual_:
  - Add sonar-scanner in environment variables in your \_profile file add the line: `export PATH=<PATH_TO_SONAR_SCANNER>/sonar-scanner-3.3.0.1492-macosx/bin:$PATH`
  - Start the SonarQube server: `cd <PATH_TO_SONARQUBE_SERVER>/bin/macosx-universal-64 ./sonar.sh start`
  - In the microservice folder run the command: `npm run sonar-scanner`
