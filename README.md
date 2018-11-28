# bioreactor
## Modules

<dl>
<dt><a href="#module_ezoph">ezoph</a> ⇒ <code><a href="#numberLike">numberLike</a></code></dt>
<dd><p>Communicate with the EZO pH device and sensor</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#numberLike">numberLike</a> : <code>number</code> | <code>string</code></dt>
<dd><p>A number, or a string containing a number.</p>
</dd>
</dl>

<a name="module_ezoph"></a>

## ezoph ⇒ [<code>numberLike</code>](#numberLike)
Communicate with the EZO pH device and sensor

**Returns**: [<code>numberLike</code>](#numberLike) - value - the output of the device. this can be anything from the pH to the current status of the device.
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| i2c | <code>Object</code> | an i2c object |
| address | <code>number</code> | address of the device |
| ph | [<code>numberLike</code>](#numberLike) | the last pH value read |
| timeout | <code>number</code> | the time taken to carry out operation, in ms. defaults to 900, the longest time needed for any operation. |


* [ezoph](#module_ezoph) ⇒ [<code>numberLike</code>](#numberLike)
    * _static_
        * [.connect()](#module_ezoph.connect)
    * _inner_
        * [~ezoph/read()](#module_ezoph..ezoph/read) ⇒ [<code>numberLike</code>](#numberLike)
        * [~ezoph/calMid()](#module_ezoph..ezoph/calMid) ⇒ [<code>numberLike</code>](#numberLike)
        * [~ezoph/calLow()](#module_ezoph..ezoph/calLow) ⇒ [<code>numberLike</code>](#numberLike)
        * [~ezoph/calHigh()](#module_ezoph..ezoph/calHigh) ⇒ [<code>numberLike</code>](#numberLike)
        * [~ezoph/command(callback, comm)](#module_ezoph..ezoph/command) ⇒ [<code>numberLike</code>](#numberLike)
        * [~ezoph/clear()](#module_ezoph..ezoph/clear)
        * [~ezoph/sendCommand(comm)](#module_ezoph..ezoph/sendCommand)
        * [~ezoph/getData(callback, timeout)](#module_ezoph..ezoph/getData)

<a name="module_ezoph.connect"></a>

### ezoph.connect()
This is 'exported' so it can be used with `require('ezoph.js').connect(pin1,pin2)`

**Kind**: static method of [<code>ezoph</code>](#module_ezoph)
**Example** *(How to use ezoph module)*
```js
//create a new instance of ph sensor
var i2c = new I2C();     // create new i2c object
var phAddress = 0x63;    // EZO pH i2c address
var sda = D23;           // setup i2c pins
var scl = D22;
i2c.setup({              // setup I2C bus
  scl:scl,
  sda:sda
});
phSensor = new ( require('ezoph') )( i2c, phAddress );
```
<a name="module_ezoph..ezoph/read"></a>

### ezoph~ezoph/read() ⇒ [<code>numberLike</code>](#numberLike)
Reads ph

**Kind**: inner method of [<code>ezoph</code>](#module_ezoph)
**Returns**: [<code>numberLike</code>](#numberLike) - data - value returned from device
<a name="module_ezoph..ezoph/calMid"></a>

### ezoph~ezoph/calMid() ⇒ [<code>numberLike</code>](#numberLike)
Single point calibration at midpoint

**Kind**: inner method of [<code>ezoph</code>](#module_ezoph)
**Returns**: [<code>numberLike</code>](#numberLike) - data - 1 if successful 2,254,255 if unsuccessful
<a name="module_ezoph..ezoph/calLow"></a>

### ezoph~ezoph/calLow() ⇒ [<code>numberLike</code>](#numberLike)
Two point calibration at low point

**Kind**: inner method of [<code>ezoph</code>](#module_ezoph)
**Returns**: [<code>numberLike</code>](#numberLike) - data - 1 if successful, 2,254,255 if unsuccessful
<a name="module_ezoph..ezoph/calHigh"></a>

### ezoph~ezoph/calHigh() ⇒ [<code>numberLike</code>](#numberLike)
Three point calibration at high point

**Kind**: inner method of [<code>ezoph</code>](#module_ezoph)
**Returns**: [<code>numberLike</code>](#numberLike) - data - 1 if successful, 2,254,255 if unsuccessful
<a name="module_ezoph..ezoph/command"></a>

### ezoph~ezoph/command(callback, comm) ⇒ [<code>numberLike</code>](#numberLike)
Sends specific command to ezo ph circuit

**Kind**: inner method of [<code>ezoph</code>](#module_ezoph)
**Returns**: [<code>numberLike</code>](#numberLike) - data - 1 if successful, 2,254,255 if unsuccessful

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> |  |
| comm | [<code>numberLike</code>](#numberLike) | command to send to circuit, ie. 'sleep', or 'i' |

<a name="module_ezoph..ezoph/clear"></a>

### ezoph~ezoph/clear()
Clears the command and data arrays (used before sending a new command)

**Kind**: inner method of [<code>ezoph</code>](#module_ezoph)
<a name="module_ezoph..ezoph/sendCommand"></a>

### ezoph~ezoph/sendCommand(comm)
Read a command as a string

**Kind**: inner method of [<code>ezoph</code>](#module_ezoph)

| Param | Type | Description |
| --- | --- | --- |
| comm | [<code>numberLike</code>](#numberLike) | the command that the device will carry out |

<a name="module_ezoph..ezoph/getData"></a>

### ezoph~ezoph/getData(callback, timeout)
Retreive data from device

**Kind**: inner method of [<code>ezoph</code>](#module_ezoph)

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | value of the data reived from device |
| timeout | <code>int</code> | the amount of time needed for the device to complete function. minimum is 900 |

<a name="numberLike"></a>

## numberLike : <code>number</code> \| <code>string</code>
A number, or a string containing a number.

**Kind**: global typedef