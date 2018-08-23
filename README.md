miIO Adapter
------------

This is adapter for WiFi-based Xiaomi devices to work with [Mozilla WoT Gateway](https://iot.mozilla.org/). It uses an awesome [miio](https://github.com/aholstenson/miio) library to connect to many Xiaomi devices, like power plugs, robot vacuums, gateways, and others.

Supported devices:

- `chuangmi.plug.m1`: WiFi Power Plug
- `lumi.gateway.v3`
  - gateway light control
  - children devices:
    - `lumi.plug`: ZigBee Power Plug + power measurement
