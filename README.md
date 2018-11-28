## Modules

<dl>
<dt><a href="#module_ezoph">ezoph</a> ⇒ <code><a href="#numberLike">numberLike</a></code></dt>
<dd><p>Communicate with the EZO pH device and sensor</p>
</dd>
<dt><a href="#module_mh_z16">mh_z16</a> ⇒ <code>number</code></dt>
<dd><p>Make a new instance of the MH_Z16 sensor with SC16IS750PW I2C/UART bridge</p>
</dd>
<dt><a href="#module_max38155k">max38155k</a></dt>
<dd><p>Communicate with the MAX38155k device and sensor</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#numberLike">numberLike</a> : <code>number</code> | <code>string</code></dt>
<dd><p>A number, or a string containing a number.</p>
</dd>
<dt><a href="#pin">pin</a> : <code>Object</code></dt>
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

<a name="module_mh_z16"></a>

## mh\_z16 ⇒ <code>number</code>
Make a new instance of the MH_Z16 sensor with SC16IS750PW I2C/UART bridge

**Returns**: <code>number</code> - - the co2 concentration measured by the device

| Param | Type | Description |
| --- | --- | --- |
| i2c | <code>Object</code> | an instance of an I2C object |
| address | <code>number</code> | the address of device (default is 0x9a) |

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| ppm | <code>number</code> | the last measured co2 concentration (can be used for debug) |


* [mh_z16](#module_mh_z16) ⇒ <code>number</code>
    * _static_
        * [.connect()](#module_mh_z16.connect)
    * _inner_
        * [~mh_z16/begin()](#module_mh_z16..mh_z16/begin)
        * [~mh_z16/calZero()](#module_mh_z16..mh_z16/calZero)
        * [~mh_z16/send(data)](#module_mh_z16..mh_z16/send)
        * [~mh_z16/parse(data)](#module_mh_z16..mh_z16/parse) ⇒ <code>Array</code>
        * [~resultCallback](#module_mh_z16..resultCallback) ⇒ <code>number</code>
        * [~resultCallback](#module_mh_z16..resultCallback) : <code>function</code>

<a name="module_mh_z16.connect"></a>

### mh_z16.connect()
This is 'exported' so it can be used with `require('mh_z16.js').connect(pin1,pin2)`

**Kind**: static method of [<code>mh\_z16</code>](#module_mh_z16)
**Example** *(How to use mh_z16 module)*
```js
//create a new instance of ph sensor
var i2c = new I2C();     // create new i2c object
var co2Address = 0x47;    // EZO pH i2c address
var sda = D23;           // setup i2c pins
var scl = D22;
i2c.setup({              // setup I2C bus
  scl:scl,
  sda:sda
});
phSensor = new ( require('mh_z16') )( i2c, co2Address );
```
<a name="module_mh_z16..mh_z16/begin"></a>

### mh_z16~mh\_z16/begin()
Initializes the mh_z16 sensor

**Kind**: inner method of [<code>mh\_z16</code>](#module_mh_z16)
<a name="module_mh_z16..mh_z16/calZero"></a>

### mh_z16~mh\_z16/calZero()
Calibrate the zero level for ppm
Must be done in normal air ~ 400ppm

**Kind**: inner method of [<code>mh\_z16</code>](#module_mh_z16)
<a name="module_mh_z16..mh_z16/send"></a>

### mh_z16~mh\_z16/send(data)
Send data to the MH_Z16

**Kind**: inner method of [<code>mh\_z16</code>](#module_mh_z16)

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Array</code> | an array of 9 integers to send to the device |

<a name="module_mh_z16..mh_z16/parse"></a>

### mh_z16~mh\_z16/parse(data) ⇒ <code>Array</code>
parse the device data and calculate ppm
bytes (2 - 5) are the actual values of the co2

**Kind**: inner method of [<code>mh\_z16</code>](#module_mh_z16)
**Returns**: <code>Array</code> - ppm - an integer value of the ppm concentration

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Array</code> | a 9 element array |

<a name="module_mh_z16..resultCallback"></a>

### mh_z16~resultCallback ⇒ <code>number</code>
Measure the co2 Concentration

**Kind**: inner typedef of [<code>mh\_z16</code>](#module_mh_z16)
**Returns**: <code>number</code> - - the value of the concentration, or 0, when there is a problem
**Example** *(How to use mh_z16.measure)*
```js
// if the concentration is to be stored in a variable ppm then:
mh_z16.measure( ()=>{} );
ppm = mh_z16.ppm
```
<a name="module_mh_z16..resultCallback"></a>

### mh_z16~resultCallback : <code>function</code>
Receive data from device

**Kind**: inner typedef of [<code>mh\_z16</code>](#module_mh_z16)
<a name="module_max38155k"></a>

## max38155k
Communicate with the MAX38155k device and sensor


| Param | Type | Description |
| --- | --- | --- |
| spi | <code>Object</code> | an SPI object |
| sck | [<code>pin</code>](#pin) | the pin that the spi clock is connected to |
| miso | [<code>pin</code>](#pin) | the pin that the spi MISO connected to |
| cs | [<code>pin</code>](#pin) | chip select for the device |

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| temp | <code>number</code> | the last temperature that the sensor recorded |
| data | <code>Array</code> | the array that holds the data from the sensor (for debug) |


* [max38155k](#module_max38155k)
    * [exports](#exp_module_max38155k--exports) ⏏
        * [~ezoph/begin()](#module_max38155k--exports..ezoph/begin)
        * [~ezoph/readC()](#module_max38155k--exports..ezoph/readC) ⇒ <code>number</code>
        * [~ezoph/readF()](#module_max38155k--exports..ezoph/readF) ⇒ <code>number</code>
        * [~ezoph/readK()](#module_max38155k--exports..ezoph/readK) ⇒ <code>number</code>
        * [~ezoph/readR()](#module_max38155k--exports..ezoph/readR) ⇒ <code>number</code>

<a name="exp_module_max38155k--exports"></a>

### exports ⏏
This is 'exported' so it can be used with `require('max31855k.js').connect(pin1,pin2)`

**Kind**: Exported member
**Example** *(How to use max31855k module)*
```js
//create a new instance of ph sensor
var spi = new SPI();     // create new spi object
var phAddress = 0x63;    // EZO pH i2c address
var miso = D25;          // setup spi pins
var cs = D33;
var sck = D32;
tempSensor = new ( require('max31855k') )( spi, sck, miso, cs );
```
<a name="module_max38155k--exports..ezoph/begin"></a>

#### exports~ezoph/begin()
Initialize the spi bus (only needs to be run once)

**Kind**: inner method of [<code>exports</code>](#exp_module_max38155k--exports)
<a name="module_max38155k--exports..ezoph/readC"></a>

#### exports~ezoph/readC() ⇒ <code>number</code>
Reads temperature in Celsius

**Kind**: inner method of [<code>exports</code>](#exp_module_max38155k--exports)
**Returns**: <code>number</code> - temp - the current temparature read from the sensor in Celsius
<a name="module_max38155k--exports..ezoph/readF"></a>

#### exports~ezoph/readF() ⇒ <code>number</code>
Reads temperature in Farenheit

**Kind**: inner method of [<code>exports</code>](#exp_module_max38155k--exports)
**Returns**: <code>number</code> - temp - the current temparature read from the sensor in Farenheit
<a name="module_max38155k--exports..ezoph/readK"></a>

#### exports~ezoph/readK() ⇒ <code>number</code>
Reads temperature in Kelvin

**Kind**: inner method of [<code>exports</code>](#exp_module_max38155k--exports)
**Returns**: <code>number</code> - temp - the current temparature read from the sensor in Kelvin
<a name="module_max38155k--exports..ezoph/readR"></a>

#### exports~ezoph/readR() ⇒ <code>number</code>
Reads temperature in Rankine

**Kind**: inner method of [<code>exports</code>](#exp_module_max38155k--exports)
**Returns**: <code>number</code> - temp - the current temparature read from the sensor in Rankine
<a name="numberLike"></a>

## numberLike : <code>number</code> \| <code>string</code>
A number, or a string containing a number.

**Kind**: global typedef
<a name="pin"></a>

## pin : <code>Object</code>
A number, or a string containing a number.

**Kind**: global typedef