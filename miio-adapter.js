'use strict';

const miio = require('miio');

let Action, Adapter, Device, Event, Property;
try {
  Adapter = require('../adapter');
  Device = require('../device');
  Property = require('../property');
} catch (e) {
  if (e.code !== 'MODULE_NOT_FOUND') {
    throw e;
  }

  const gwa = require('gateway-addon');
  Action = gwa.Action;
  Adapter = gwa.Adapter;
  Device = gwa.Device;
  Event = gwa.Event;
  Property = gwa.Property;
}

const TypeMapping = {
  'miio:power-plug': 'SmartPlug',
};

const CapabilitiesMapping = {
  'switchable-power': {
    properties: {
      power: {
        metadata: {
          label: 'On/Off',
          type: 'boolean',
          '@type': 'OnOffProperty',
        },
        get() {
          return this.power();
        },
        set(status) {
          return this.setPower(status);
        },
      },
    },
  },
};

class AbstractThingProperty extends Property {
  constructor(device, name, descr, propInfo) {
    super(device, name, descr);
    this.propInfo = propInfo;
    console.log('fetching initial state', name);
    propInfo.get.call(this.device.thing).then(
      value => {
        console.log('getting initial state', value);
        this.setCachedValue(value);
      },
      error => {
        console.error('error getting initial value', error);
      },
    );
  }

  async setValue(value) {
    await this.propInfo.set.call(this.device.thing, value);
    const adjustedValue = this.setCachedValue(value);
    this.device.notifyPropertyChanged(this);
    return adjustedValue;
  }
}

class AbstractThingDevice extends Device {
  constructor(adapter, id, thing) {
    super(adapter, id);

    this.thing = thing;
    this.name = thing.miioModel;

    this['@type'] = Array.from(thing.metadata.types)
      .map(type => TypeMapping[type])
      .filter(Boolean);

    console.log('adding device', thing.metadata);
    for (const cap of Array.from(thing.metadata.capabilities)) {
      if (!CapabilitiesMapping[cap]) {
        continue;
      }
      const { properties } = CapabilitiesMapping[cap];
      console.log('adding cap', cap);
      for (const [propName, propInfo] of Object.entries(properties)) {
        this.properties.set(
          propName,
          new AbstractThingProperty(
            this,
            propName,
            propInfo.metadata,
            propInfo,
          ),
        );
      }
    }

    this.adapter.handleDeviceAdded(this);
  }
}

class MiioAdapter extends Adapter {
  constructor(adapterManager, manifestName) {
    super(adapterManager, 'miio-things', manifestName);
    adapterManager.addAdapter(this);
    this.discoverDevices();
  }

  discoverDevices() {
    const devices = miio.devices();

    devices.on('available', info => {
      if (!info.token) {
        return;
      }
      try {
        new AbstractThingDevice(this, info.device.id, info.device);
      } catch (error) {
        console.error(error);
      }
    });

    devices.on('unavailable', device => {
      // TODO: Implement
    });
  }

  startPairing(timeoutSeconds) {
    this.discoverDevices();
  }
}

module.exports = MiioAdapter;
