import serbus

# Create an I2CDev instance for interfacing to /dev/i2c-0:
bus = serbus.I2CDev(0)
bus.open()

# Read a single byte from the slave device with address 0x50:
data = bus.read(0x50, 1)
print "byte received: {:x}".format(data[0])

bus.close()