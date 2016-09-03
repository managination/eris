# VPN server description
Of all solutions it was decided to use [SoftEther](https://www.softether.org/) as this is the only known opensource multiprotocol VPN servers. It is installed into ```/opt/vpnserver```
# How to connect to VPN net
## Windows
Windows users can connect using native Windows SSTP vpn client.
### Prerequisites

**These are one-time steps only**

Download [vpn server root](Managination.cer) certificate and import it *Local Computer* store into *Trusted Root Certification Authorities* section.

### Usage

Create a new VPN conection to ```eris.managination.com``` and use credential provided for authenthification.

# Other options and OS
Other options are Softether or OpenVPN client
