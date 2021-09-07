(function() {
  'use strict';

  class TongueTracker {
    constructor() {
      this.device = null;
      this.server = null;
      this._characteristics = new Map();
    }
    connect() {
		let options = {
			filters: [				
				{services: ['5f7a5812-6280-4915-b672-7964c428b910']},
				{name: 'capled'},
				{namePrefix: 'Prefix'}
		]
		}
      return navigator.bluetooth.requestDevice(options)      
	  .then(device => {
        this.device = device;
        return device.gatt.connect();
      })
      .then(server => {
        this.server = server;
        return server.getPrimaryService('5f7a5812-6280-4915-b672-7964c428b910');
      })	  
      .then(service => {
        statusText.textContent = 'Connected';
        return this._cacheCharacteristic(service, 'd79480cf-8431-4491-bca3-4ca6f04b3283');
        
      })
	  
	  
    }

    /* Tongue Tracker Service */

    startNotificationsLocation() {
      return this._startNotifications('d79480cf-8431-4491-bca3-4ca6f04b3283');
    }
    stopNotificationsLocation() {
      return this._stopNotifications('d79480cf-8431-4491-bca3-4ca6f04b3283');
    }
    
    /* Utils */

    _cacheCharacteristic(service, characteristicUuid) {
      return service.getCharacteristic(characteristicUuid)
      .then(characteristic => {
        this._characteristics.set(characteristicUuid, characteristic);
      });
    }
    _readCharacteristicValue(characteristicUuid) {
      let characteristic = this._characteristics.get(characteristicUuid);
      return characteristic.readValue()
      .then(value => {
        // In Chrome 50+, a DataView is returned instead of an ArrayBuffer.
        value = value.buffer ? value : new DataView(value);
        return value;
      });
    }
    _writeCharacteristicValue(characteristicUuid, value) {
      let characteristic = this._characteristics.get(characteristicUuid);
      return characteristic.writeValue(value);
    }
    _startNotifications(characteristicUuid) {
      let characteristic = this._characteristics.get(characteristicUuid);
      // Returns characteristic to set up characteristicvaluechanged event
      // handlers in the resolved promise.
      return characteristic.startNotifications()
      .then(() => characteristic);
    }
    _stopNotifications(characteristicUuid) {
      let characteristic = this._characteristics.get(characteristicUuid);
      // Returns characteristic to remove characteristicvaluechanged event
      // handlers in the resolved promise.
      return characteristic.stopNotifications()
      .then(() => characteristic);
    }
  }

  window.TongueTracker = new TongueTracker();

})();
