# Doit State Machine

**Doit is still in beta. All the features work but not yet tested throughly. Use at your own risk.**

Doit is a lightweight state machine engine running on Node JS and inspired by Windows Workflow Foundation. It has the minimum set of action types ready and can be extended with more.

Doit offers:
- Simplicity. I tried to stay away from unnecessary abstractions as much as possible.
- Redis backed persistence layer. It is possible to develop other persistence providers easily.
- Redis backed caching layer. This layer also can be extended with other providers (MongoDB provider is in development).
- Code generation from JSON definition files with the help of Handlebars templates.

## Roadmap
* Web based dashboard.
* WebGL based workflow designer / action code editor.
* Scheduling actions. Doit has an Async activity that can be scheduled but this requires the workflow to stay in memory. So we need a better way to schedule the workflows.
* Validation of the workflow while generating code.

## Quick Start
Clone this repository and run
```bash
$ npm install
```
You can start the project with:
```bash
$ npm run start
```

## JSON scenario file format
Doit generates scenario code files from simple JSON documents. Since we don't have a designer (yet) we need to create these documents by hand.

### Scenario Definition:
* **id**: Id of the scenario. Also the file name for the generated code.
* **name**: Human friendly name of the scenario.
* **version**: It will be possible to run different versions of the workflows in the future. So why not putting here a version field already?
* **globalVariables**: Each scenario uses the same instances of global variables.
* **actorVariables**: Each scenario runs for a specific actor. You can think of actors as customers, cars or IOT devices. If more than one scenario is running for an actor, they can share variables.
* **scenarioVariables**: These are local for each scenario.
* **triggers**: As doit scenarios are simply state machines, transitioning between states happen by the help of triggers. Every state is connected by a trigger and every transitioning between states take place by firing triggers. More on this later.
* **states**: These are the possible states for the scenario. 

### More on Triggers
As you already know, triggers are what drive the wofklow by putting the workflow in different states based on inputs from the outside world or output of the workflow actions.
Trigger properties are:
* **id**: Id of the trigger. Mandatory for code generation.
* **description**: Human friendly name for the trigger.
* **condition**: A boolean statement that is checked before running the trigger. If the condition returns *false* the trigger doesn't run.
* **source**: The source state id of the trigger. If any trigger is fired and the workflow is not in the *source* state, then request is rejected.
* **target**: The target state id of the trigger. If the trigger is valid then the workflow transitions to the *target* state.
* **action**: Before switching to the new state, it is possible to run any action. This property takes an action definition.

### More on States
Every scenario starts with an *initial* state. You can add any number of states into the scenario and connect them with triggers. Every scenario ends with one or more *final* state.
State properties are:
* **id**: Id of the state. Mandatory for code generation.
* **description**: Human friendly name for the state.
* **entry**: Any *Action* derived class. This action runs just after state becomes active.
* **exit**: Any *Action* derived class. This action runs just after state becomes inactive.

### Sample scenario file:
```js
{
  "id": "simpleSM",
  "name": "Simple State Machine",
  "version": "1",
  "globalVariables": [],
  "actorVariables": [
    { "name": "machineIsTurnedOn", "type": "boolean" }
  ],
  "scenarioVariables": [],
  "triggers": [
    {
      "id": "turnOn",
      "description": "Turn on",
      "condition": "true",
      "source": "start",
      "target": "on",
      "action": {
        "id": "turnOnAssign",
        "type": "assign",
        "to": "machineIsTurnedOn",
        "value": "true"
      }
    },
    {
      "id": "turnOff",
      "description": "Turn Off",
      "condition": "true",
      "source": "on",
      "target": "off"
    }
  ],
  "states": [
    {
      "id": "start",
      "description": "Inital State"
    },
    {
      "id": "on",
      "description": "On",
      "entry": {
        "id": "onBranch",
        "type": "branch",
        "branches": [
          {
            "id": "isTurnedOn",
            "condition": "this.machineIsTurnedOn == true",
            "action": {
              "id": "isTurnedOnCode",
              "type": "code",
              "code": "console.log('Yes, it is turned on.');"
            }
          },
          {
            "id": "isTurnedOff",
            "condition": "this.machineIsTurnedOn == false",
            "action": {
              "id": "isTurnedOffLog",
              "type": "log",
              "message": "The machine is turned off."
            }
          }
        ]
      }
    },
    {
      "id": "off",
      "description": "Off"
    }
  ]
}
```
Scenario starts in the inital state and waits for any trigger to run. When **turnOn** trigger is fired, it's action runs and sets the actor variable *machineIsTurnedOn* to true. This means any other scenario that uses the same actor variable will be able to access the same value. Since the *condition* of the trigger returns true, transition takes place and scenario switches into **on** state.

**on** state has an *entry* action defined, so as soon as the state becomes active, this action runs. The type of the action is *Branch* that works like a *switch* statement. *Branch* activity loops through the conditions of it's branches and runs the action of the first suitable branch. In this scenario first branch is a *Code* action, which simply runs the code specified. The second action is a *Log* action, which logs it's *message* property to the configured log target.

To generate the scenario code, just post this JSON to **http://localhost:3000/scenario/build**

And here's the generated scenario code based on the json file above:
```typescript
import * as Core from '../engine/core';
import * as Actions from '../engine/actions';

@Core.triggers('simpleSM', 'turnOn','turnOff')
export class Scenario extends Core.Scenario {
    private _machineIsTurnedOn: boolean;
    get machineIsTurnedOn(): boolean {
        return this._machineIsTurnedOn;
    }
    set machineIsTurnedOn(value: boolean) {
        this._machineIsTurnedOn = value;
    }
    
    build() {
        this.id = 'simpleSM';
        
        const start = new Core.State('start', 'Inital State');
        const isTurnedOn = new Actions.Branch();
        isTurnedOn.condition = () => this.machineIsTurnedOn == true;
        const isTurnedOnCode = new Actions.CodeAction(this);
        isTurnedOnCode.code = () => {
            console.log('Yes, it is turned on.');
            return Promise.resolve();
        };
        isTurnedOn.action = isTurnedOnCode;
        const isTurnedOff = new Actions.Branch();
        isTurnedOff.condition = () => this.machineIsTurnedOn == false;
        const isTurnedOffLog = new Actions.LogAction(this);
        isTurnedOffLog.message = 'The machine is turned off.';
        isTurnedOff.action = isTurnedOffLog;
        
        const onBranch = new Actions.BranchAction(this);
        onBranch.branches = [isTurnedOn,isTurnedOff];
        const on = new Core.State('on', 'On');
        on.entry = onBranch;
        const off = new Core.State('off', 'Off');
        this.states = [start,on,off];
        this.currentState = start;
        const turnOnAssign = new Actions.AssignAction(this);
        turnOnAssign.to = 'machineIsTurnedOn';
        turnOnAssign.value = true;
        
        const turnOn = new Core.Trigger('turnOn', 'Turn on');
        turnOn.condition = () => true;
        turnOn.source = start;
        turnOn.target = on;
        turnOn.action = turnOnAssign;
        
        const turnOff = new Core.Trigger('turnOff', 'Turn Off');
        turnOff.condition = () => true;
        turnOff.source = on;
        turnOff.target = off;
        
        this.triggerIds = ['turnOn','turnOff'];
        this.triggers = [turnOn,turnOff];
    }
}
```
To run this scenario, post data to **http://localhost/scenario/fire/turnOn**. The data needs to include a **uniqueId** field as each scenario is separated from the others based on this id. Here's a sample JSON you can use to trigger the scenario:
```js
{
  "uniqueId": "100",
  "machineIsTurnedOn": "true"
}
```
All the active scenarios that has a trigger with the id **turnOn** will fire and an aggregated result will be returned from the engine.