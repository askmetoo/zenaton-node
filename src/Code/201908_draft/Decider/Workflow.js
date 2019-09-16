const { ExternalZenatonError } = require("../../../Errors");
const workflowManager = require("./WorkflowManager");
const Dispatch = require("../Client/Dispatch");
const Execute = require("./Execute");
const Wait = require("./Wait");
const objectify = require("../Services/Objectify");

const workflow = function workflow(name, definition) {
  // check that provided data have the right format
  if (typeof name !== "string" || name.length === 0) {
    throw new ExternalZenatonError(
      "When getting or creating a workflow, 1st parameter (workflow name) must be a non-empty string",
    );
  }
  //  workflow getter
  if (typeof definition === "undefined") {
    return workflowManager.get(name);
  }
  // check workflow definition
  if (typeof definition !== "function" && typeof definition !== "object") {
    throw new ExternalZenatonError(
      `When creating worflow "${name}", 2nd parameter (workflow definition) must be a function or an object`,
    );
  }
  if (typeof definition === "object") {
    if (definition.handle === undefined) {
      throw new ExternalZenatonError(
        `When creating worflow "${name}", 2nd parameter (workflow definition) must have a "handle" method`,
      );
    }
    const reservedMethods = ["handle"];
    Object.keys(definition).forEach((method) => {
      if (
        reservedMethods.indexOf(method) >= 0 &&
        typeof definition[method] !== "function"
      ) {
        throw new ExternalZenatonError(
          `When creating workflow "${name}",  "${method}" method must be a function, not a "${typeof definition[
            method
          ]}"`,
        );
      }
    });
  }

  const WorkflowClass = class WorkflowClass {
    set processor(processor) {
      this._processor = processor;
    }

    get properties() {
      const properties = {};
      Object.keys(this).forEach((prop) => {
        if (prop !== "_context" && prop !== "_processor") {
          properties[prop] = this[prop];
        }
      });
      return properties;
    }

    set properties(properties) {
      Object.keys(this).forEach((prop) => {
        if (prop !== "_context" && prop !== "_processor") {
          delete this[prop];
        }
      });
      Object.assign(this, properties);
    }

    get context() {
      return this._context;
    }

    set context(context) {
      if (this._context !== undefined) {
        throw new ExternalZenatonError(
          'Sorry, "context" is reserved and can not be mutated',
        );
      }
      this._context = context;
    }

    get execute() {
      return objectify(Execute, this._processor);
    }

    get dispatch() {
      return objectify(Dispatch, this._processor);
    }

    get wait() {
      return objectify(Wait, this._processor);
    }

    set execute(_e) {
      throw new ExternalZenatonError(
        'Sorry, "execute" is reserved and can not be mutated',
      );
    }

    set dispatch(_d) {
      throw new ExternalZenatonError(
        'Sorry, "dispatch" is reserved and can not be mutated',
      );
    }

    set wait(_w) {
      throw new ExternalZenatonError(
        'Sorry, "wait" is reserved and can not be mutated',
      );
    }
  };

  // set class name
  Object.defineProperty(WorkflowClass, "name", { value: name });

  // user-defined methods
  if (typeof definition === "function") {
    WorkflowClass.prototype.handle = definition;
  } else {
    Object.keys(definition).forEach((method) => {
      WorkflowClass.prototype[method] = definition[method];
    });
  }

  // register it in our workflow manager
  workflowManager.add(name, WorkflowClass);

  return WorkflowClass;
};

module.exports = workflow;
