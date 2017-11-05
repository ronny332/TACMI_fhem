# TACMI_fhem
Nodejs implementation for CoE (CAN over Ethernet) of TA (Technische Alternative).

TACMI_fhem is a complete rebuild of ![TA_COE_fhem](https://github.com/ronny332/TA_COE_fhem) without external dependencies and a better handling and maintenance.
It acts as a bridge between a ![C.M.I.](https://www.ta.co.at/en/remote-maintenance/cmi/) device and ![FHEM](https://fhem.de/).

Just a modern Nodejs Interpreter (for ES6 support, recommended is Nodejs v8.00+) is required.

The goal is to make reading and writing from/to a C.M.I. device possible, TA_CoE_fhem was only able to read analog values.

This document will be updated with usage advices as soon the software is able to provide the main features (read/write).
The later working version will contain some limitations, caused by the CoE protocol itself (especially sending binary values is connected to some restrictions).