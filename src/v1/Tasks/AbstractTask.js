const Engine = require('../Engine/Engine')

module.exports = class AbstractTask {
	constructor(name) {
		// class name
		this.name = name
	}

	// asynchroneous execution within a workflow
	dispatch() {
		new Engine().dispatch([this])
	}

	// synchroneous execution within a workflow
	execute() {
		return new Engine().execute([this])[0]
	}

	static methods() {
		return ['handle', 'maxProcessingTime']
	}
}
