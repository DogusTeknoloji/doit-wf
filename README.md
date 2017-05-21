# Doit State Machine

**Doit is still in beta. All the features work but not tested. Use at your own risk.**

Doit is a lightweight state machine engine running on Node JS and inspired by Windows Workflow Foundation. It has the minimum set of action types ready and can be extended with more.

Doit offers:
- Simplicity. I tried to stay away from unnecessary abstractions as much as possible.
- Redis backed persistence layer. It is possible to develop other persistence providers easily.
- Redis backed caching layer. This layer also can be extended with other providers (MongoDB provider is in development).
- Code generation from JSON definition files with the help of Handlebars templates.

## Roadmap
* Web based dashboard.
* WebGL based workflow designer / action code editor.
* Scheduling actions. Doit has Async activity that can be scheduled but this requires the workflow to stay in memory. 


